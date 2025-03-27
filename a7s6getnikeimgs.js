const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const chunkArray = (array, size) => array.reduce((acc, _, i) => i % size === 0 ? [...acc, array.slice(i, i + size)] : acc, []);

async function parseWebsites() {
    // Чтение и подготовка URL
    const urls = (await fs.readFile('links_part_1.txt', 'utf-8'))
        .split('\n')
        .filter(url => url.trim() !== '');

    // Запуск браузера один раз
    const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const results = [];
    const concurrencyLimit = 20;
    // Ограничение параллельных страниц
    const urlChunks = chunkArray(urls, concurrencyLimit);

    // Обработка URL по частям
    for (const chunk of urlChunks) {
        const chunkPromises = chunk.map(async (url) => {
            let page;
            try {
                page = await browser.newPage();
                await page.setViewport({ width: 1280, height: 720 });
                await page.goto(url, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 60000 
                });

                const siteData = await page.evaluate(() => {
                    const imgContainer = document.querySelector('div.css-1vt9b1c');
                    const imgMainElement = imgContainer ? imgContainer.querySelector('img') : null;
                    const imgMain = imgMainElement ? imgMainElement.getAttribute('src') : null;

                    const mainContainer = document.querySelector('div.css-1wg28dk');
                    const inputContainers = mainContainer 
                        ? mainContainer.querySelectorAll('div.css-6ftarl') 
                        : [];
                    
                    const imgs = {};
                    inputContainers.forEach((container, index) => {
                        const input = container.querySelector('input');
                        if (input && input.id) {
                            imgs[`input_${index}`] = input.id;
                        }
                    });

                    return { imgMain, imgs };
                });

                console.log(`Успешно обработан: ${url}`);
                return {
                    url,
                    imgMain: siteData.imgMain,
                    imgs: siteData.imgs
                };
            } catch (error) {
                console.error(`Ошибка при обработке ${url}: ${error.message}`);
                return {
                    url,
                    imgMain: null,
                    imgs: {},
                    error: error.message
                };
            } finally {
                if (page) await page.close(); // Гарантированное закрытие страницы
            }
        });

        // Ожидание завершения обработки текущей партии
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);

        // Промежуточная запись результатов для экономии памяти
        await fs.writeFile(
            'b3f1_nikeIMG.json',
            JSON.stringify(results, null, 2),
            'utf-8'
        );
    }

    await browser.close();
    console.log('Парсинг завершен, результаты сохранены в b3f1_nikeIMG.json');
}

parseWebsites()
    .catch(error => {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    });
