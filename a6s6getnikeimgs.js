const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const websitesFile = 'links_part_1.txt';
  const outputFile = "b2f1_nikeIMGS.json"; 

  const websites = fs.readFileSync(websitesFile, 'utf8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const totalCount = websites.length; // Общее количество всех URL-ов
  const batchSize = 20;
  let results = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : [];
  const processedUrls = new Set(results.map(r => r.url));
  const websitesToProcess = websites.filter(url => !processedUrls.has(url));
  const totalToProcess = websitesToProcess.length; // Количество URL-ов, которые нужно обработать

  async function processUrl(url, browser) {
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
        /////////
    
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 720 });
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 67000 
            });


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

      ////////
    } catch (error) {
      console.error(`Ошибка при обработке ${url}:`, error);
      return { url, content: null, error: error.toString() };
    } finally {
      await page.close();
    }
  }

  const browser = await puppeteer.launch({
    executablePath: "/snap/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const batches = [];
  for (let i = 0; i < websitesToProcess.length; i += batchSize) {
    batches.push(websitesToProcess.slice(i, i + batchSize));
  }

  let processedCount = results.length; // Уже обработанные записи

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchPromises = batch.map((url, index) => {
      processedCount++; // Увеличиваем счетчик обработанных элементов
      const progress = ((processedCount / totalCount) * 100).toFixed(2); // Прогресс относительно общего числа URL-ов
      console.log(`Обработка: ${url} | Прогресс: ${processedCount}/${totalCount} (${progress}%)`);
      return processUrl(url, browser);
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  }

  await browser.close();
  console.log(`Результаты сохранены в ${outputFile}`);
})();

