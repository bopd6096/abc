// Используем node-fetch версии 2 для совместимости с CommonJS
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Функция для извлечения списка товаров со страницы
async function getProducts(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки ${url}: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const products = [];

    // Здесь предполагается, что карточка товара имеет класс .product-card.
    // Настройте селекторы под фактическую структуру страницы.
    $('.product-card').each((i, element) => {
      const name = $(element).find('.product-name').text().trim();
      const price = $(element).find('.product-price').text().trim();
      // Получаем ссылку на страницу товара – преобразуем относительный URL в абсолютный, если необходимо
      let link = $(element).find('a').attr('href');
      if (link && !link.startsWith('http')) {
        link = new URL(link, url).href;
      }

      products.push({ name, price, link });
    });

    return products;
  } catch (error) {
    console.error(`Ошибка: ${error}`;
    return [];
  }
}

// Основная функция запуска
(async () => {
  // Пример URL страницы с товарами. При необходимости замените на нужный.
  const url = 'https://answear.ua/k/dim/vanna-kimnata/dlya-prannya/prasuvalni-doshky';
  const products = await getProducts(url);
  console.log(JSON.stringify(products, null, 2));
})();
