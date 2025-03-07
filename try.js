const puppeteer = require('puppeteer');

async function scrapeWithPuppeteer() {
    const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});
    const page = await browser.newPage();
    await page.goto('https://answear.ua/s/new-menu/vona', { waitUntil: 'networkidle2' });

    const products = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.Productited__productCardDescription__ru0dS')).map(el => ({
            name: el.querySelector('.product-title')?.innerText.trim(),
            price: el.querySelector('.product-price')?.innerText.trim(),
            link: el.querySelector('a')?.href
        }));
    });

    console.log(JSON.stringify(products, null, 2));
    await browser.close();
}

scrapeWithPuppeteer();
