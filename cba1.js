const puppeteer = require('puppeteer');
const fs = require('fs-extra');

const BASE_URL = 'https://answear.ua/';
const OUTPUT_FILE = 'products.json';
const DELAY = 2000; // Задержка для обхода блокировки

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function getCategories(page) {
    console.log('🔍 Получаем список категорий...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    return await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.menu-category a'))
            .map(el => ({ name: el.innerText.trim(), link: el.href }));
    });
}

async function getLastPageNumber(page) {
    const lastPage = await page.evaluate(() => {
        const pages = document.querySelectorAll('.pagination a');
        return pages.length ? parseInt(pages[pages.length - 2].innerText, 10) : 1;
    });
    return isNaN(lastPage) ? 1 : lastPage;
}

async function scrapeProductsFromPage(page, url) {
    console.log(`🔄 Загружаем страницу: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await delay(DELAY);

    return await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.product-card')).map(el => ({
            name: el.querySelector('.product-name')?.innerText.trim(),
            price: el.querySelector('.product-price')?.innerText.trim(),
            link: el.querySelector('a')?.href,
            image: el.querySelector('.product-image img')?.src
        }));
    });
}

async function scrapeProductDetails(page, product) {
    console.log(`🔍 Парсим товар: ${product.link}`);
    await page.goto(product.link, { waitUntil: 'networkidle2' });
    await delay(DELAY);

    return await page.evaluate(() => ({
        description: document.querySelector('.product-description')?.innerText.trim(),
        brand: document.querySelector('.brand-name')?.innerText.trim(),
        material: document.querySelector('.product-material')?.innerText.trim(),
        sku: document.querySelector('.product-sku')?.innerText.trim(),
        availability: document.querySelector('.product-availability')?.innerText.trim(),
    }));
}

async function scrapeCategory(browser, category) {
    const page = await browser.newPage();
    let products = [];

    await page.goto(category.link, { waitUntil: 'networkidle2' });
    const lastPage = await getLastPageNumber(page);
    console.log(`📂 Категория "${category.name}" (Страниц: ${lastPage})`);

    for (let i = 1; i <= lastPage; i++) {
        const url = `${category.link}?page=${i}`;
        const pageProducts = await scrapeProductsFromPage(page, url);
        if (pageProducts.length === 0) break;

        for (let product of pageProducts) {
            const details = await scrapeProductDetails(page, product);
            Object.assign(product, details);
        }

        products = products.concat(pageProducts);
    }

    await page.close();
    return { category: category.name, products };
}

async function main() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

    const categories = await getCategories(page);
    let allData = [];

    for (let category of categories) {
        const data = await scrapeCategory(browser, category);
        allData.push(data);
    }

    await browser.close();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
    console.log(`✅ Готово! Данные сохранены в ${OUTPUT_FILE}`);
}

main();
