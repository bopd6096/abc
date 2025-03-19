/* Пример на Node.js с использованием Puppeteer */
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
try {
// Читаем список ссылок из файла links.txt (одна ссылка на строку)
const linksData = fs.readFileSync('links.txt', 'utf-8');
const links = linksData.split('\n').filter(line => line.trim() !== '');

// Запускаем браузер Puppeteer
 const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium", // Укажи свой путь, если нужно
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });


// Подготовим массив для результата
const results = [];

// Проходимся по каждой ссылке
for (let url of links) {
  console.log(`Обрабатываем: ${url}`);
  const page = await browser.newPage();
  
  // Устанавливаем viewport для альбомной ориентации (например, 1280x720)
  await page.setViewport({ width: 1280, height: 720 });

  // Переходим на страницу и ждём окончания загрузки контента
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  
  // Извлекаем нужные данные. Допустим, нас интересует текст из элемента с классом ".content"
  const data = await page.evaluate(() => {
    const elem = document.querySelector('.content');
    return elem ? elem.innerText.trim() : 'Элемент не найден';
  });
  
  // Добавляем результат в массив
  results.push(`URL: ${url}\n${data}\n\n`);
  await page.close();
}

// Сохраняем результаты в файл output.txt
fs.writeFileSync('output.txt', results.join(''), 'utf-8');
console.log('Сбор данных завершён, файл output.txt создан.');
await browser.close();
} catch (error) { console.error('Произошла ошибка:', error); } })();



// Запускаем браузер Puppeteer
const browser = await puppeteer.launch();
const results = [];

// Пройдем по каждому URL
for (let url of links) {
  console.log(`Обрабатывается: ${url}`);
  const page = await browser.newPage();

  // Устанавливаем viewport для альбомной ориентации (например, 1280x720)
  await page.setViewport({ width: 1280, height: 720 });

  // Загружаем страницу и ждем окончания загрузки динамического контента
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // Выполняем скрипт на странице для сбора src элементов img внутри div.css-1vt9b1c
  const imageSrcs = await page.evaluate(() => {
    // Собираем все div с классом "css-1vt9b1c"
    const containers = document.querySelectorAll("div.css-1vt9b1c");
    const srcArray = [];
    // Перебираем найденные контейнеры
    containers.forEach(container => {
      // Ищем img внутри данного контейнера
      const imgs = container.querySelectorAll("img");
      imgs.forEach(img => {
        if (img.src) {
          srcArray.push(img.src);
        }
      });
    });
    return srcArray;
  });

  // Форматируем результат: URL и список src для этой страницы
  let result = `URL: ${url}\n`;
  if (imageSrcs.length) {
    result += imageSrcs.join("\n") + "\n\n";
  } else {
    result += "Изображения не найдены.\n\n";
  }
  results.push(result);
  await page.close();
}

// Записываем результаты в файл output.txt
fs.writeFileSync("output.txt", results.join(""), "utf-8");
console.log("Парсинг завершен. Данные сохранены в output.txt");
await browser.close();
