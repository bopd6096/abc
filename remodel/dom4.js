const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  // Файл со списком сайтов (каждый URL на новой строке)
  const websitesFile = 'output.txt';
  // Файл для сохранения результатов
  const outputFile = 'discriptions.json';

  // Чтение списка сайтов
  const websites = fs.readFileSync(websitesFile, 'utf8')
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  // Запуск браузера в headless-режиме
const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium", // Укажи свой путь, если нужно
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });


  const results = [];

  // Обработка каждого URL из списка
  for (const url of websites) {
    console.log(`Обработка: ${url}`);
    const page = await browser.newPage();
    try {
               await page.goto(url, {
    waitUntil: 'networkidle0'  // дожидаемся, когда сети будут «тихими»
  });


      // await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      // Извлечение содержимого нужного элемента
      const content = await page.evaluate(() => {
        // Селектор, учитывающий вложенность элементов:
        // body → #experience-wrapper → #__next[data-reactroot] → main с классами → 
        // div с классами "nds-grid pdp-grid css-qqclnk ehf3nt20" → 
        // div с классами "grid-item price pl6-lg z1 css-1jk6ulu nds-grid-item" → 
        // div#product-description-container с data-testid и классом "pt7-sm" → 
        // p с нужным классом.
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

  // Сохранение результатов в JSON файл с отступами для читаемости
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`Результаты сохранены в ${outputFile}`);
})();
