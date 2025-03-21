const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function parseWebsites() {

    const urls = (await fs.readFile('test_b1f0_nike_product_urls.txt', 'utf-8'))

        .split('\n')
        .filter(url => url.trim() !== '');

  const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const results = [];

    for (const url of urls) {
        try {
            const page = await browser.newPage();
            await page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            await page.setViewport({ width: 1280, height: 720 });

            // Ждем возможной динамической загрузки (до 5 секунд)

            const siteData = await page.evaluate(() => {
                // Диагностика для imgMain
                const imgContainer = document.querySelector('div.css-1vt9b1c');
                const imgMainElement = imgContainer ? imgContainer.querySelector('img') : null;
                const imgMain = imgMainElement ? imgMainElement.getAttribute('src') : null;

                console.log('imgContainer found:', !!imgContainer);
                console.log('imgMainElement found:', !!imgMainElement);
                console.log('imgMain value:', imgMain);

                // Диагностика для inputs
                const mainContainer = document.querySelector('div.css-1wg28dk');
                const inputContainers = mainContainer 
                    ? mainContainer.querySelectorAll('div.css-6ftarl') 
                    : [];
                
                console.log('mainContainer found:', !!mainContainer);
                console.log('inputContainers count:', inputContainers.length);

                const imgs = {};
                inputContainers.forEach((container, index) => {
                    const input = container.querySelector('input');
                    if (input && input.id) {
                        imgs[`input_${index}`] = input.id;
                    }
                });

                console.log('Found input IDs:', Object.values(imgs));

                return { imgMain, imgs };
            });

            results.push({
                url: url,
                imgMain: siteData.imgMain,
                imgs: siteData.imgs
            });

            console.log(`Успешно обработан: ${url}`);
            await page.close();

        } catch (error) {
            console.error(`Ошибка при обработке ${url}: ${error.message}`);
            results.push({
                url: url,
                imgMain: null,
                imgs: {},
                error: error.message
            });
        }
    }

    await browser.close();

    await fs.writeFile(
        'b1f1_nikeIMG.json',
        JSON.stringify(results, null, 2),
        'utf-8'
    );

    console.log('Парсинг завершен, результаты сохранены в results.json');
}

parseWebsites()
    .catch(error => {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    });
