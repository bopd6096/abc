const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');



(async () => {
// Читаем ссылки
const linksFile = 'output.txt';
const links = readLinksFromFile(linksFile);

// Запускаем браузер
    
 const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium", // Укажи свой путь, если нужно
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

// Будем собирать результаты в массив
const results = [];

for (const link of links) {
try {
            console.log(`Обрабатываем: ${link}`);
const page = await browser.newPage();

  // Устанавливаем альбомную ориентацию в viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Переходим на страницу
  await page.goto(link, {
    waitUntil: 'networkidle0'  // дожидаемся, когда сети будут «тихими»
  });
results.push(`${link}\n${pTxt}\n`);

  // Закрываем страницу
  await page.close();
} catch (error) {
  console.error(`Ошибка при обработке ссылки ${link}:`, error);
}
}

// Закрываем браузер
await browser.close();

// Записываем результаты в текстовый файл
fs.writeFileSync('discription.txt', results.join('\n----\n'), 'utf-8');

console.log('Парсинг завершён, результаты в output.txt');
})();



// Функция чтения ссылок (её можно вынести отдельно) 
function readLinksFromFile(filePath) {
    const absolutePath = path.resolve(filePath); 
    const data = fs.readFileSync(absolutePath, 'utf-8');
    return data .split('\n') .map(line => line.trim()) .filter(Boolean); 
}






  // Можно дополнительно подождать селектор, если нужно
  // await page.waitForSelector('.some-class');

 // Выполняем скрипт на странице для сбора src элементов img внутри div.css-1vt9b1c
  // const pTxt = await page.evaluate(() => {
    // const pEl = document.querySelectorAll("p.nds-text.css-pxxozx.e1yhcai00.text-align-start.appearance-body1.color-primary.weight-regular"); return pEl ? pEl.innerText : null;
    // const discription = "";
    // Перебираем найденные контейнеры
    // containers.forEach(container => {
    //   // Ищем img внутри данного контейнера
    //   const imgs = container.querySelectorAll("img");
    //   imgs.forEach(img => {
    //     if (img.src) {
    //       srcArray.push(img.src);
    //     }
    //   });
    // });
    // return srcArray;
  // });


      // Сохраняем результат (для каждой ссылки может быть свой формат)
  
