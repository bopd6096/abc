const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const websitesFile = 'test_b1f0_nike_product_urls.txt';
  const outputFile = "test_b1f3_nike_discriptions.json"; 

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
    const batchPromises = batch.map((url, index) => {
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