const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    const websitesFile = 'test_b1f0_nike_product_urls.txt';
    const outputFile = "b1f1_nikeIMG.json";

    const websites = fs.readFileSync(websitesFile, 'utf8')
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

    const totalCount = websites.length;
    const batchSize = 3;
    let results = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : [];
    const processedUrls = new Set(results.map(r => r.url));
    const websitesToProcess = websites.filter(url => !processedUrls.has(url));

    async function processUrl(url) {
        const browser = await puppeteer.launch({
            executablePath: "/snap/bin/chromium",
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 67000 });
            await page.setViewport({ width: 1280, height: 720 });

            // Ждем появления кнопки
            const buttonSelector = 'button.css-1u1z458';
            await page.waitForSelector(buttonSelector, { timeout: 5000 });

            // Функция для получения текущего количества изображений
            const getImageCount = async () => {
                return await page.evaluate(() => {
                    const containers = document.querySelectorAll("div.css-1vt9b1c");
                    let count = 0;
                    containers.forEach(container => {
                        count += container.querySelectorAll("img").length;
                    });
                    return count;
                });
            };

            // Многократные клики с проверкой новых изображений
            let previousImageCount = 0;
            const maxClicks = 8; // Максимальное количество кликов
            for (let i = 0; i < maxClicks; i++) {
                try {
                    await page.click(buttonSelector);
                    await page.waitForTimeout(1000); // Ждем рендеринга новых изображений

                    const currentImageCount = await getImageCount();
                    if (currentImageCount === previousImageCount) {
                        console.log(`Для ${url} новых изображений больше не появилось после ${i + 1} кликов`);
                        break;
                    }
                    previousImageCount = currentImageCount;
                } catch (clickError) {
                    console.log(`Ошибка клика для ${url} на итерации ${i + 1}: ${clickError.message}`);
                    break;
                }
            }

            // Собираем все изображения после всех кликов
            const imageSrcs = await page.evaluate(() => {
                const containers = document.querySelectorAll("div.css-1vt9b1c");
                const srcArray = [];
                containers.forEach(container => {
                    const imgs = container.querySelectorAll("img");
                    imgs.forEach(img => {
                        if (img.src) {
                            srcArray.push(img.src);
                        }
                    });
                });
                return srcArray;
            });

            return { url, srcArray: imageSrcs };
        } catch (error) {
            console.error(`Ошибка при обработке ${url}:`, error);
            return { url, content: null, error: error.toString() };
        } finally {
            await page.close();
            await browser.close();
        }
    }

    const batches = [];
    for (let i = 0; i < websitesToProcess.length; i += batchSize) {
        batches.push(websitesToProcess.slice(i, i + batchSize));
    }

    let processedCount = results.length; // Начальное количество уже обработанных URL

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map((url) => {
            processedCount++; // Увеличиваем счетчик для каждого обрабатываемого URL
            const progress = ((processedCount / totalCount) * 100).toFixed(2);
            console.log(`Обработка: ${url} | Прогресс: ${processedCount}/${totalCount} (${progress}%)`);
            return processUrl(url);
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    }

    console.log(`Результаты сохранены в ${outputFile}`);
})();
