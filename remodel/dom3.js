"use strict";

const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
const results = []; // здесь будем собирать итоговые объекты

try {
// Читаем ссылки из файла links.txt (каждая ссылка с новой строки)
const linksData = fs.readFileSync("output.txt", "utf-8");
const links = linksData
.split("\n")
.map(url => url.trim())
.filter(url => url.length > 0);

 
 const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium", // Укажи свой путь, если нужно
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });


// Обрабатываем ссылки последовательно, чтобы порядок не нарушился
for (let url of links) {
  console.log(`Обрабатывается: ${url}`);

  // Инициализируем объект с данными для данной ссылки.
  // По умолчанию data пустой, если произойдёт ошибка – так и останется.
  let resultItem = { url, data: {} };

  try {
    const page = await browser.newPage();
    // Устанавливаем viewport для альбомной ориентации (например, 1280x720)
    await page.setViewport({ width: 1280, height: 720 });

    // Переходим на страницу и ждем окончания загрузки динамически подгружаемого контента
    // await page.goto(url, { waitUntil: "networkidle2", timeout: 3000 });
               await page.goto(url, {
    waitUntil: 'networkidle0'  // дожидаемся, когда сети будут «тихими»
  });


    // Выполняем скрипт в контексте страницы, чтобы собрать атрибуты src у всех img,
    // которые находятся внутри div с классом "css-1vt9b1c"
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

    // Если изображения найдены, запишем их в поле data
    resultItem.data = { images: imageSrcs };
    await page.close();
  } catch (pageError) {
    console.error(`Ошибка при обработке ${url}:`, pageError);
    // Оставляем resultItem.data пустым, если произошла ошибка
  }

  // Добавляем объект результата в итоговый массив
  results.push(resultItem);
}

await browser.close();

// Сохраняем результат в JSON-файл (форматируем с отступами для удобства чтения)
fs.writeFileSync("output.json", JSON.stringify(results, null, 2), "utf-8");
console.log("Парсинг завершён. Результаты сохранены в output.json");
} catch (error) { console.error("Произошла общая ошибка:", error); } })();
