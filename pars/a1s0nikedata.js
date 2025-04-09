//// Первый общий парс. Голый код (исходник первого шага)
/// на выходе ключевой исходный массив
//  в массиве "первая" группа из начальной страници для парса
// обернутая в обьект метаданых с нфой про последующие ендпоинты 
// количество ендпоинтов(страниц для парса) зависит от выбраного количества проды на ней (см. строка 25 -> [ вар 24, 50, 100 ] точно рабочие, но можно поиграть)

const axios = require('axios');
const fs = require('fs');

async function fetchNikeProducts() {
  // Базовый URL API Nike
  const baseUrl = 'https://api.nike.com/discover/product_wall/v1/marketplace/US/language/en/consumerChannelId/d9a5bc42-4b9c-4976-858a-f159cf99c647';
  
  // Заголовки для запроса
  const headers = {
    'nike-api-caller-id': 'com.nike.commerce.snkrs.web',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };
  
  // Параметры запроса
  const path = '/w';
  const queryType = 'PRODUCTS';
  const options = 'r:01';
  let anchor = 0;           // Начальная точка пагинации
  const count = 100;        // Количество продуктов за запрос
  let allProducts = [];     // Массив для хранения всех продуктов
  let hasMore = true;       // Флаг для проверки наличия данных

  // Цикл для выполнения запросов
  while (hasMore) {
    const url = `${baseUrl}?path=${path}&queryType=${queryType}&options=${options}&anchor=${anchor}&count=${count}`;
    try {
      const response = await axios.get(url, { headers });
      const data = response.data;
      
      // Предполагаем, что продукты находятся в поле 'products'
      const products = data || [];
      allProducts = allProducts.concat(products);
      
      // Проверяем, есть ли еще данные
      hasMore = products.length === count;
      anchor += count; // Смещаем anchor для следующего запроса
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
      hasMore = false; // Прерываем цикл при ошибке
    }
  }

  // Сохраняем данные в файл
  fs.writeFileSync('../JSON/b0f1_nike_fechInit.json', JSON.stringify(allProducts, null, 2));  // Первоначальный массив
  console.log('Всего получено продуктов:', allProducts.length);
}

// Запускаем функцию
fetchNikeProducts();
