const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const websitesFile = 'b1f0_nike_product_urls.txt';
    // const websitesFile = 'test_b1f0_nike_product_urls.txt';
  // const outputFile = 'b1f3_nike_discriptions.json';
    const outputFile = "test_b1f3_nike_discriptions.json"; 

  const websites = fs.readFileSync(websitesFile, 'utf8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const totalCount = websites.length;
  const batchSize = 25;
  let results = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : [];
  const processedUrls = new Set(results.map(r => r.url));
  const websitesToProcess = websites.filter(url => !processedUrls.has(url));

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
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 67000 });
    await page.setViewport({ width: 1280, height: 720 });
      const content = await page.evaluate(() => {
        const selector = 'body #experience-wrapper #__next[data-reactroot] main.d-sm-flx.flx-dir-sm-c.flx-jc-sm-c.flx-ai-sm-c .nds-grid.pdp-grid.css-qqclnk.ehf3nt20 .grid-item.price.pl6-lg.z1.css-1jk6ulu.nds-grid-item #product-description-container.pt7-sm[data-testid="product-description-container"] p.nds-text.css-pxxozx.e1yhcai00.text-align-start.appearance-body1.color-primary.weight-regular';
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null;
      });

 // const imageSrcs = await page.evaluate(() => {
      // const containers = document.querySelectorAll("div.css-1vt9b1c");
      // const srcArray = [];
      // containers.forEach(container => {
        // const imgs = container.querySelectorAll("img");
        // imgs.forEach(img => {
          // if (img.src) {
            // srcArray.push(img.src);
          // }
        // });
      // });
      // return srcArray;
            // const selector = 'div.css-1vt9b1c img';
            // const elements = document.querySelectorAll(selector);
            // return elements ? Array.from(elements).map(element => element.src) : null;



    // });

      const contentDivSizes = await page.evaluate(() => {
        const element = document.querySelector('div.d-sm-flx.flx-dir-sm-c.flx-dir-lg-cr');
        return element ? element.innerHTML : null;
      });



      return { url, content, contentDivSizes };
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

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchPromises = batch.map((url, index) => {
      const currentItem = results.length + batchIndex * batchSize + index + 1;
      const progress = ((currentItem / totalCount) * 100).toFixed(2);
      console.log(`Обработка: ${url} | Прогресс: ${currentItem}/${totalCount} (${progress}%)`);
      return processUrl(url, browser);
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  }

  await browser.close();
  console.log(`Результаты сохранены в ${outputFile}`);
})();
