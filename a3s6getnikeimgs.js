const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
    const websitesFile = 'test_b1f0_nike_product_urls.txt';
    // const outputFile = "test_b1f3_nike_discriptions.json";
    
    const outputFile = "b1f2_nikeIMG.json";





    const websites = fs.readFileSync(websitesFile, 'utf8')
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

    const totalCount = websites.length;
    const batchSize = 3;
    let results = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : [];
    const processedUrls = new Set(results.map(r => r.url));
    const websitesToProcess = websites.filter(url => !processedUrls.has(url));

    console.log(`Всего URL для обработки: ${totalCount}`);
    console.log(`Уже обработано: ${results.length}`);
    console.log(`Осталось обработать: ${websitesToProcess.length}`);

    async function processUrl(url) {
        console.log(`Запуск обработки: ${url}`);
        const browser = await puppeteer.launch({
            executablePath: "/snap/bin/chromium",
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        console.log(`Браузер запущен для ${url}`);
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
            console.log(`Переход по адресу: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 67000 });
            console.log(`Страница загружена: ${url}`);
            await page.setViewport({ width: 375, height: 812, isMobile: true });
            console.log(`Viewport установлен в мобильный режим для ${url}`);

            const carouselSelector = '#mobile-image-carousel';
            console.log(`Ожидание элемента карусели: ${carouselSelector}`);
            await page.waitForSelector(carouselSelector, { timeout: 5000 });
            console.log(`Элемент карусели найден: ${url}`);

            async function swipeRightToLeft() {
                const element = await page.$(carouselSelector);
                const boundingBox = await element.boundingBox();
                if (!boundingBox) {
                    throw new Error('Не удалось определить границы элемента карусели');
                }
                console.log(`Границы карусели: x:${boundingBox.x}, y:${boundingBox.y}, w:${boundingBox.width}, h:${boundingBox.height}`);

                const startX = boundingBox.x + boundingBox.width - 10;
                const endX = boundingBox.x + 10;
                const y = boundingBox.y + boundingBox.height / 2;

                await page.mouse.move(startX, y);
                await page.mouse.down();
                await page.mouse.move(endX, y, { steps: 10 });
                await page.mouse.up();
                await page.waitForTimeout(1000);
            }

            const swipeCount = 7;
            for (let i = 0; i < swipeCount; i++) {
                try {
                    console.log(`Выполняется свайп ${i + 1} из ${swipeCount} для ${url}`);
                    await swipeRightToLeft();
                    console.log(`Свайп ${i + 1} успешно выполнен для ${url}`);
                } catch (swipeError) {
                    console.error(`Ошибка свайпа для ${url} на итерации ${i + 1}: ${swipeError.message}`);
                    break;
                }
            }

            console.log(`Сбор данных изображения для ${url}`);
            const imageSrc = await page.evaluate(() => {
                const container = document.querySelector('div.nds-skeleton.loaded.css-1w8qfmf.border-radius-s');
                if (!container) {
                    console.log('Контейнер изображения не найден');
                    return null;
                }
                const img = container.querySelector('img');
                return img ? img.src : null;
            });

            if (imageSrc) {
                console.log(`Изображение найдено для ${url}: ${imageSrc}`);
            } else {
                console.log(`Изображение не найдено для ${url}`);
            }

            return { url, src: imageSrc };
        } catch (error) {
            console.error(`Ошибка при обработке ${url}: ${error.message}`);
            return { url, src: null, error: error.toString() };
        } finally {
            console.log(`Закрытие страницы для ${url}`);
            await page.close();
            console.log(`Закрытие браузера для ${url}`);
            await browser.close();
        }
    }

    const batches = [];
    for (let i = 0; i < websitesToProcess.length; i += batchSize) {
        batches.push(websitesToProcess.slice(i, i + batchSize));
    }
    console.log(`Создано батчей: ${batches.length}`);

    let processedCount = results.length;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Обработка батча ${batchIndex + 1} из ${batches.length}`);
        const batchPromises = batch.map((url) => {
            processedCount++;
            const progress = ((processedCount / totalCount) * 100).toFixed(2);
            console.log(`Обработка: ${url} | Прогресс: ${processedCount}/${totalCount} (${progress}%)`);
            return processUrl(url);
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        console.log(`Сохранение результатов батча ${batchIndex + 1} в ${outputFile}`);
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    }

    console.log(`Обработка завершена. Результаты сохранены в ${outputFile}`);
})();
