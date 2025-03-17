const fs = require('fs');
const puppeteer = require('puppeteer');

async function parseWebsites() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    try {
        const websites = fs.readFileSync('output.txt', 'utf-8')
            .split('\n')
            .filter(url => url.trim() !== '');

        const results = [];

        for (const url of websites) {
            try {
                const page = await browser.newPage();
                // Устанавливаем таймаут и ждем загрузку
                await page.goto(url, { 
                    waitUntil: 'networkidle0',
                    timeout: 30000 
                });

                // Получаем src изображений
                const imageSrcs = await page.evaluate(() => {
                    const images = document.querySelectorAll('img.css-1sjjyv8');
                    return Array.from(images).map(img => img.src);
                });

                if (imageSrcs.length > 0) {
                    imageSrcs.forEach(src => {
                        results.push(`${url}: ${src}`);
                    });
                } else {
                    results.push(`${url}: Изображения с классом css-1sjjyv8 не найдены`);
                }

                await page.close();
            } catch (error) {
                results.push(`${url}: Ошибка - ${error.message}`);
            }
        }

        fs.writeFileSync('results.txt', results.join('\n'), 'utf-8');
        console.log('Парсинг завершен');

    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await browser.close();
    }
}

parseWebsites();
