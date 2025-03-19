// const fs = require('fs');
// const puppeteer = require('puppeteer');
// const beautify = require('js-beautify').html;
//
// (async () => {
//   // Файл со списком сайтов (каждый URL на новой строке)
//   const websitesFile = 'output.txt';
//   // Файл для сохранения результатов
//   const outputFile = 'sizes.json';
//
//   // Чтение списка сайтов
//   const websites = fs.readFileSync(websitesFile, 'utf8')
//     .split('\n')
//     .map(url => url.trim())
//     .filter(url => url.length > 0);
//
//   // Запуск браузера в headless-режиме
// const browser = await puppeteer.launch({
//         executablePath: "/snap/bin/chromium", // Укажи свой путь, если нужно
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });
//
//
//   const results = [];
//
//   // Обработка каждого URL из списка
//   for (const url of websites) {
//     console.log(`Обработка: ${url}`);
//     const page = await browser.newPage();
//     try {
//                await page.goto(url, {
//     waitUntil: 'networkidle0'  // дожидаемся, когда сети будут «тихими»
//   });
//       // Извлечение содержимого нужного элемента
//       const content = await page.evaluate(() => {
//         // Ищем элемент <div> с нужными классами
//         const element = document.querySelector('div.d-sm-flx.flx-dir-sm-c.flx-dir-lg-cr');
//         // Если элемент найден, возвращаем его полное содержимое (innerHTML)
//         return element ? element.innerHTML.trim() : null;
//       });
//         const formattedContent = content ? beautify(content, { indent_size: 2, preserve_newlines: true }).trim() : null;
//       results.push({ url, content: formattedContent });
//       // results.push({ url, content });
//     } catch (error) {
//       console.error(`Ошибка при обработке ${url}:`, error);
//       results.push({ url, content: null, error: error.toString() });
//     } finally {
//       await page.close();
//     }
//   }
//
//   await browser.close();
//
//   // Сохранение результатов в JSON файл с отступами для читаемости
//   fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
//   console.log(`Результаты сохранены в ${outputFile}`);
// })();
//


const fs = require('fs');
const puppeteer = require('puppeteer');
const beautify = require('js-beautify').html;

(async () => {
  // Файл со списком сайтов (каждый URL на новой строке)

  const websitesFile = 'output.txt';

  // Файл для сохранения результатов
 const outputFile = 'sizes.json';

  // Чтение списка сайтов из файла
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


  let resultText = '';

  // Обработка каждого URL из списка
  for (const url of websites) {
    console.log(`Обработка: ${url}`);
    const page = await browser.newPage();
    try {
               await page.goto(url, {
    waitUntil: 'networkidle0'  // дожидаемся, когда сети будут «тихими»
  });

      // Извлечение содержимого нужного элемента
      const content = await page.evaluate(() => {
        const element = document.querySelector('div.d-sm-flx.flx-dir-sm-c.flx-dir-lg-cr');
        return element ? element.innerHTML : null;
      });
      // Форматирование полученного HTML для удобочитаемости
      const formattedContent = content
        ? beautify(content, { indent_size: 2, preserve_newlines: true }).trim()
        : 'Контент не найден';
      
      // Формирование текстового результата
      resultText += `URL: ${url}\n`;
      resultText += `Контент:\n${formattedContent}\n`;
      resultText += '==============================\n\n';
    } catch (error) {
      console.error(`Ошибка при обработке ${url}:`, error);
      resultText += `URL: ${url}\n`;
      resultText += `Ошибка: ${error.toString()}\n`;
      resultText += '==============================\n\n';
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Сохранение результатов в текстовый файл
  fs.writeFileSync(outputFile, resultText, 'utf8');
  console.log(`Результаты сохранены в ${outputFile}`);
})();
