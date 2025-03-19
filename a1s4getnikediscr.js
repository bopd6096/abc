const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const websitesFile = 'b1f0_nike_product_urls.txt';
  const outputFile = 'b1f3_nike_discriptions.json';

  // Чтение списка сайтов
  const websites = fs.readFileSync(websitesFile, 'utf8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);
  
  // Добавляем общее количество для расчета прогресса
  const totalCount = websites.length;

  const browser = await puppeteer.launch({
    executablePath: "/snap/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];

  // Обработка каждого URL из списка
  for (let index = 0; index < websites.length; index++) {
    const url = websites[index];
    const currentItem = index + 1;
    const progress = ((currentItem / totalCount) * 100).toFixed(2);

    // Выводим URL и прогресс
    console.log(`Обработка: ${url}`);
    console.log(`Прогресс: ${currentItem}/${totalCount} (${progress}%)`);

    const page = await browser.newPage();
    try {
      await page.goto(url, {
        waitUntil: 'networkidle0'
      });

      const content = await page.evaluate(() => {
        const selector = 'body #experience-wrapper #__next[data-reactroot] main.d-sm-flx.flx-dir-sm-c.flx-jc-sm-c.flx-ai-sm-c .nds-grid.pdp-grid.css-qqclnk.ehf3nt20 .grid-item.price.pl6-lg.z1.css-1jk6ulu.nds-grid-item #product-description-container.pt7-sm[data-testid="product-description-container"] p.nds-text.css-pxxozx.e1yhcai00.text-align-start.appearance-body1.color-primary.weight-regular';
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null;
      });
      results.push({ url, content });
    } catch (error) {
      console.error(`Ошибка при обработке ${url}:`, error);
      results.push({ url, content: null, error: error.toString() });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`Результаты сохранены в ${outputFile}`);
})();