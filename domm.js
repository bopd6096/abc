const axios = require('axios');
const jsdom = require('jsdom');
const vm = require('vm');
const fs = require('fs');
const { JSDOM } = jsdom;

async function parseWebsite(url) {
    try {
        // 1. Загружаем HTML-страницу по URL
        const response = await axios.get(url);
        
        // 2. Парсим HTML и получаем DOM-дерево
        const dom = new JSDOM(response.data);
        const body = dom.window.document.body;
        
        // Проверяем, существует ли тег <body>
        if (!body) {
            return { error: "Тег <body> не найден" };
        }

        // 3. Извлекаем все теги <script> внутри <body>
        const scripts = body.getElementsByTagName('script');
        
        // Проверяем, есть ли минимум 3 тега <script>
        if (scripts.length < 3) {
            return { 
                error: `Найдено только ${scripts.length} тегов <script>, нужно минимум 3` 
            };
        }

        // 4. Берем содержимое третьего тега <script>
        const thirdScript = scripts[4];
        const scriptContent = thirdScript.textContent.trim() || "";
        
        // 5. Преобразуем содержимое в JSON-объект
        try {
            const context = { window: {} };
            vm.runInNewContext(scriptContent, context);
            const preloadedState = context.window.__PRELOADED_STATE__;
            const products = preloadedState.products;
           const { ware: { list } } = products;
const extractedData = list.map(product => {
  // Извлекаем основные поля верхнего уровня
  const {
    id,
    name,
    subtitle,
    fullName,
    seoImageAlt,
    slug,
    price,
    priceRegular,
    priceMinimal,
    pbbCode,
    categories,
    frontendUuid,
    productBrand,
    color,
    productImages
  } = product;

  // Извлекаем только id и name из productBrand
  const brand = productBrand ? {
    id: productBrand.id,
    name: productBrand.name
  } : null;

  // Извлекаем только name и colorPbbCode из color
  const colorData = color ? {
    name: color.name,
    colorPbbCode: color.colorPbbCode
  } : null;

  // Извлекаем mainImageUrl и последний объект из picture
  const images = productImages ? {
    mainImageUrl: productImages.mainImageUrl,
    attributes: {
      picture: productImages.attributes && productImages.attributes.picture && productImages.attributes.picture.length > 0
        ? [productImages.attributes.picture[productImages.attributes.picture.length - 1]]
        : []
    }
  } : null;

  // Возвращаем новый объект с нужными полями
  return {
    id,
    name,
    subtitle,
    fullName,
    seoImageAlt,
    slug,
    price,
    priceRegular,
    priceMinimal,
    pbbCode,
    categories,
    frontendUuid,
    productBrand: brand,
    color: colorData,
    productImages: images
  };
});

console.log(extractedData);
            return {
                extractedData
            };
        

        } catch (jsonError) {
            return { 
                error: `Ошибка парсинга JSON: ${jsonError.message}` 
            };
        }

    } catch (error) {
        return { 
            error: `Произошла ошибка при загрузке страницы: ${error.message}` 
        };
    }
}

async function processUrlsFromFile(filePath) {
    try {
        // 1. Читаем файл с URL
        const data = fs.readFileSync(filePath, 'utf-8');
        const urls = data.split('\n').filter(url => url.trim() !== '');
        
        // 2. Обрабатываем каждый URL параллельно
        const results = await Promise.all(
            urls.map(url => parseWebsite(url))
        );
        
        // 3. Сохраняем результаты в файл results.json
        fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
        console.log('Результаты сохранены в results.json');
        
        return results;
    } catch (error) {
        console.error('Ошибка при обработке файла:', error);
    }
}

// Запускаем обработку
const filePath = 'exemeple.txt'; // Укажите путь к вашему файлу с URL
processUrlsFromFile(filePath)
    .then(results => {
        console.log('Обработка завершена!');
        console.log('Результаты:', results);
    })
    .catch(error => console.error('Ошибка:', error));
