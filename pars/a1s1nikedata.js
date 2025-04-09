///// Основа
//// Парс основных даных (работет) 
//// полный список (на текущий момент)
/// изменения данного файла не предвидятся ( в случае корекции кода - клон от этого)
// повтор исполнения  не требуется

// на выходе массив с днными прдуктов 
// + предварительная структуризация

const fs = require('fs');
const axios = require('axios');
const https = require('https');

const TOTAL_REQUESTS = 102; // Количество запросов
const BASE_URL = "https://api.nike.com/discover/product_wall/v1/marketplace/US/language/en/consumerChannelId/d9a5bc42-4b9c-4976-858a-f159cf99c647";

const HEADERS = {
    "nike-api-caller-id": "com.nike.commerce.snkrs.web",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9"
};

// Отключаем валидацию SSL (если проблемы с сертификатами)
const agent = new https.Agent({ rejectUnauthorized: false });

const outputFile = "../JSON/b0f2_nike_fetchData.json";


async function fetchNikeProducts() {
    let allProducts = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : [];

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        let anchor = 100 + i * 100;
        let url = `${BASE_URL}?path=/w&queryType=PRODUCTS&options=r:01&anchor=${anchor}&count=100`;

        try {
            console.log(`Запрос #${i + 1}: ${url}`);

            let response = await axios.get(url, {
                headers: HEADERS,
                httpsAgent: agent
            });

            const data = response.data;
            console.log(`Статус ответа: ${response.status}`);
            
 const productGroupings = response.data.productGroupings || [];

            // Собираем все products из productGroupings

            productGroupings.forEach(group => {
                if (group.products && Array.isArray(group.products)) {
                    // Деструктурируем только указанные поля
                    const destructuredProducts = group.products.map(product => ({
                        groupKey: product.groupKey,
                        productCode: product.productCode,
                        productType: product.productType,
                        productSubType: product.productSubType,
                        globalProductId: product.globalProductId,
                        internalPid: product.internalPid,
                        merchProductId: product.merchProductId,
                        copy: product.copy,
                        displayColors: product.displayColors,
                        prices: product.prices,
                        colorwayImages: product.colorwayImages,
                        featuredAttributes: product.featuredAttributes,
                        pdpUrl: product.pdpUrl,
                        isNewUntil: product.isNewUntil,
                        promotions: product.promotions,
                        customization: product.customization,
                        badgeAttribute: product.badgeAttribute,
                        badgeLabel: product.badgeLabel,

                        // try2: data

                    }));

                    allProducts = allProducts.concat(destructuredProducts);
                    // allProducts = allProducts.concat(group.products);
                }
            });


            console.log(`Получено товаров: ${allProducts.length}`);


 //            let products = [];
 //            
 //            // Собираем все products из productGrouping
 //            productGroupings.forEach(group => {
 //                if (group.products && Array.isArray(group.products)) {
 //                    products = products.concat(group.products);
 //                }
 //            });
 //
 //            // Деструктурируем только указанные поля
 //            const destructuredProducts = products.map(product => ({
 //                groupKey: product.groupKey,
 //                productCode: product.productCode,
 //                productType: product.productType,
 //                productSubType: product.productSubType,
 //                globalProductId: product.globalProductId,
 //                internalPid: product.internalPid,
 //                merchProductId: product.merchProductId,
 //                copy: product.copy,
 //                displayColors: product.displayColors,
 //                prices: product.prices,
 //                colorwayImages: product.colorwayImages,
 //                pbpUrl: product.pbpUrl
 //            }));
 //
 //            allProducts = allProducts.concat(destructuredProducts);
 //            console.log(`Получено товаров: ${products.length}`);
 //            
      // const products = data || [];

      // allProducts = allProducts.concat(products);
            // if (response.data && response.data.length) {
            //     console.log(`Получено товаров: ${response.data.length}`);
            //     allProducts.push(...response.data);
            // } else {
            //     console.warn("Ответ не содержит товаров.");
            //     console.log(response.data);
            // }
        } catch (error) {
            console.error(`Ошибка запроса #${i + 1}:`, error.response ? error.response.data : error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

   fs.writeFileSync('../JSON/b0f1_nike_fetchData.json', JSON.stringify(allProducts, null, 2));
    
    console.log(`Данные сохранены в ${outputFile}`);
}

fetchNikeProducts();
