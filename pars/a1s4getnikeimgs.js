//// Парсер для данных относящихся к данным фоток из Nike
/// Парсит ссылки на фотки и сохраняет их в json файл
/// Использует Puppeteer для автоматизации браузера
/// Сохраняет результаты в файл. 
// поменять входящие и исходящие файлы перед использованием



const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const readline = require('readline');

const chunkArray = (array, size) => array.reduce((acc, _, i) => i % size === 0 ? [...acc, array.slice(i, i + size)] : acc, []);

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
}

function updateProgressBar(processed, total, times) {
    const width = 55;
    const percent = (processed / total) * 100;
    const filled = Math.round((width * processed) / total);
    const bar = '█'.repeat(filled) + '…'.repeat(width - filled);

    // Расчет ETA на основе скользящего среднего
    const avgTimePerUrl = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const remainingUrls = total - processed;
    const etaSeconds = times.length > 0 ? avgTimePerUrl * remainingUrls : 'N/A';

    // Перемещаем курсор в нижнюю строку и обновляем прогресс-бар
    readline.cursorTo(process.stdout, 0, process.stdout.rows - 2);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`Progress [${bar}] ${percent.toFixed(2)}% (${processed}/${total}) ETA: ${etaSeconds === 'N/A' ? 'N/A' : formatTime(etaSeconds)}`);
    
    // Возвращаем курсор вверх для логов
    readline.cursorTo(process.stdout, 0, process.stdout.rows - 2);
}

async function parseWebsites() {
    const urls = (await fs.readFile('../JSON/b0f1_nike_new_urls.txt', 'utf-8'))
        .split('\n')
        .filter(url => url.trim() !== '');

    const totalUrls = urls.length;
    let processedUrls = 0;
    const times = []; // Массив для хранения времени обработки последних ссылок
    const maxTimes = 60; // Ограничение на количество хранимых значений (размер окна скользящего среднего)

    // Очистка консоли и резервирование места для прогресс-бара
    console.clear();
    process.stdout.write('\n'); // Дополнительная строка для прогресс-бара внизу

    const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const results = [];
    const concurrencyLimit = 20;
    const urlChunks = chunkArray(urls, concurrencyLimit);

    for (const chunk of urlChunks) {
        const chunkPromises = chunk.map(async (url) => {
            let page;
            const startUrlTime = Date.now(); // Время начала обработки текущей ссылки
            try {
                page = await browser.newPage();
                await page.setViewport({ width: 1280, height: 720 });
                await page.goto(url, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 67000 
                });

                const siteData = await page.evaluate(() => {
                    const imgContainer = document.querySelector('div.css-1vt9b1c');
                    const imgMainElement = imgContainer ? imgContainer.querySelector('img') : null;
                    const imgMain = imgMainElement ? imgMainElement.getAttribute('src') : null;

                    const mainContainer = document.querySelector('div.css-1wg28dk');
                    const inputContainers = mainContainer 
                        ? mainContainer.querySelectorAll('div.css-1cv5ztv') 
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
                if (page) await page.close();
                const urlTime = (Date.now() - startUrlTime) / 1000; // Время обработки текущей ссылки в секундах
                times.push(urlTime);
                if (times.length > maxTimes) times.shift(); // Удаляем старые значения, если превышен лимит
                processedUrls++;
                updateProgressBar(processedUrls, totalUrls, times);
            }
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);

        await fs.writeFile(
            'b3f6_nikeIMG.json',
            JSON.stringify(results, null, 2),
            'utf-8'
        );
    }

    await browser.close();
    console.log('\nПарсинг завершен, результаты сохранены в b3f1_nikeIMG.json');
}

parseWebsites()
    .catch(error => {
        console.error('Критическая ошибка:', error);
        process.exit(1);
    });

// const puppeteer = require('puppeteer');
// const fs = require('fs').promises;
// const readline = require('readline');
//
// const chunkArray = (array, size) => array.reduce((acc, _, i) => i % size === 0 ? [...acc, array.slice(i, i + size)] : acc, []);
//
// function updateProgressBar(processed, total) {
//     const width = 55;
//     const percent = (processed / total) * 100;
//     const filled = Math.round((width * processed) / total);
//     const bar = '█'.repeat(filled) + '…'.repeat(width - filled);
//     
//     // Перемещаем курсор в нижнюю строку и обновляем прогресс-бар
//     readline.cursorTo(process.stdout, 0, process.stdout.rows - 1);
//     readline.clearLine(process.stdout, 0);
//     process.stdout.write(`Progress [${bar}] ${percent.toFixed(2)}% (${processed}/${total})`);
//     
//     // Возвращаем курсор вверх для логов
//     readline.cursorTo(process.stdout, 0, process.stdout.rows - 2);
// }
//
// async function parseWebsites() {
//     // Чтение и подготовка URL
//     const urls = (await fs.readFile('links_part_1.txt', 'utf-8'))
//         .split('\n')
//         .filter(url => url.trim() !== '');
//
//     const totalUrls = urls.length;
//     let processedUrls = 0;
//
//     // Очистка консоли и резервирование места для прогресс-бара
//     console.clear();
//     process.stdout.write('\n'); // Дополнительная строка для прогресс-бара внизу
//
//     // Запуск браузера
//     const browser = await puppeteer.launch({
//         executablePath: "/snap/bin/chromium",
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
//     });
//
//     const results = [];
//     const concurrencyLimit = 15;
//     const urlChunks = chunkArray(urls, concurrencyLimit);
//
//     // Обработка URL по частям
//     for (const chunk of urlChunks) {
//         const chunkPromises = chunk.map(async (url) => {
//             let page;
//             try {
//                 page = await browser.newPage();
//                 await page.setViewport({ width: 1280, height: 720 });
//                 await page.goto(url, { 
//                 //    waitUntil: 'networkidle2',
//                  waitUntil: 'domcontentloaded',
//                     timeout: 60000 
//                 });
//
//                 const siteData = await page.evaluate(() => {
//                     const imgContainer = document.querySelector('div.css-1vt9b1c');
//                     const imgMainElement = imgContainer ? imgContainer.querySelector('img') : null;
//                     const imgMain = imgMainElement ? imgMainElement.getAttribute('src') : null;
//
//                     const mainContainer = document.querySelector('div.css-1wg28dk');
//                     const inputContainers = mainContainer 
//                         ? mainContainer.querySelectorAll('div.css-6ftarl') 
//                         : [];
//                     
//                     const imgs = {};
//                     inputContainers.forEach((container, index) => {
//                         const input = container.querySelector('input');
//                         if (input && input.id) {
//                             imgs[`input_${index}`] = input.id;
//                         }
//                     });
//
//                     return { imgMain, imgs };
//                 });
//
//                 console.log(`Успешно обработан: ${url}`);
//                 return {
//                     url,
//                     imgMain: siteData.imgMain,
//                     imgs: siteData.imgs
//                 };
//             } catch (error) {
//                 console.error(`Ошибка при обработке ${url}: ${error.message}`);
//                 return {
//                     url,
//                     imgMain: null,
//                     imgs: {},
//                     error: error.message
//                 };
//  покупки            } finally {
//                 if (page) await page.close();
//                 processedUrls++;
//                 updateProgressBar(processedUrls, totalUrls);
//             }
//         });
//
//         const chunkResults = await Promise.all(chunkPromises);
//         results.push(...chunkResults);
//
//         // Промежуточная запись результатов
//         await fs.writeFile(
//             'b3f1_nikeIMG.json',
//             JSON.stringify(results, null, 2),
//             'utf-8'
//         );
//     }
//
//     await browser.close();
//     console.log('\nПарсинг завершен, результаты сохранены в b3f1_nikeIMG.json');
// }
//
// parseWebsites()
//     .catch(error => {
//         console.error('Критическая ошибка:', error);
//         process.exit(1);
//     });
