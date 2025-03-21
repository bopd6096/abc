const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Функция для форматирования прогресса
function formatProgress(processed, total) {
    const percentage = ((processed / total) * 100).toFixed(1);
    return `${processed}/${total} (${percentage}%)`;
}

async function processBatch(urls, browser, outputFile, totalUrls, processedCountRef) {
    const results = [];
    let processedCount = processedCountRef.value; // Ссылка на общее количество обработанных

    const pagePromises = urls.map(async (url) => {
        let page;
        try {
            page = await browser.newPage();
            await page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await page.setViewport({ width: 1280, height: 720 });

            const siteData = await page.evaluate(() => {
                const imgMainElement = document.querySelector('div.css-1vt9b1c img');
                const imgMain = imgMainElement ? imgMainElement.getAttribute('src') : null;

                const inputContainers = document.querySelectorAll('div.css-1wg28dk div.css-6ftarl');
                const imgs = {};
                
                inputContainers.forEach((container, index) => {
                    const input = container.querySelector('input');
                    if (input && input.id) {
                        imgs[`input_${index}`] = input.id;
                    }
                });

                return { imgMain, imgs };
            });

            processedCount++;
            console.log(`Успешно обработан: ${url} - ${formatProgress(processedCount, totalUrls)}`);
            return {
                url,
                imgMain: siteData.imgMain,
                imgs: siteData.imgs
            };
        } catch (error) {
            console.error(`Ошибка при обработке ${url}: ${error.message}`);
            processedCount++;
            console.log(`Прогресс (с ошибкой): ${formatProgress(processedCount, totalUrls)}`);
            return {
                url,
                imgMain: null,
                imgs: {},
                error: error.message
            };
        } finally {
            if (page) await page.close();
        }
    });

    const batchResults = await Promise.all(pagePromises);
    results.push(...batchResults);
    processedCountRef.value = processedCount; // Обновляем общее количество

    // Читаем существующий файл и добавляем новые данные
    let existingData = [];
    try {
        const fileContent = await fs.readFile(outputFile, 'utf-8');
        existingData = JSON.parse(fileContent);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }

    const updatedData = [...existingData, ...results];
    await fs.writeFile(outputFile, JSON.stringify(updatedData, null, 2), 'utf-8');

    console.log(`Пачка обработана, данные добавлены в ${outputFile} - ${formatProgress(processedCount, totalUrls)}`);
    return results;
}

async function parseWebsites() {
    const urls = (await fs.readFile('test_b1f0_nike_product_urls.txt', 'utf-8'))
        .split('\n')
        .filter(url => url.trim() !== '');

    const totalUrls = urls.length;
    const processedCountRef = { value: 0 }; // Объект для отслеживания прогресса

    const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const outputFile = 'b1f1_nikeIMG.json';
    const batchSize = 5;

    console.log(`Всего URL для обработки: ${totalUrls}`);

    for (let i = 0; i < urls.length; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize);
        console.log(`\nОбработка пакета ${Math.floor(i / batchSize) + 1} из ${Math.ceil(urls.length / batchSize)}`);
        await processBatch(batchUrls, browser, outputFile, totalUrls, processedCountRef);
    }

    await browser.close();
    console.log(`Парсинг завершен, все данные сохранены в ${outputFile} - ${formatProgress(totalUrls, totalUrls)}`);
}

parseWebsites()
    .catch(error => {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    });
