////// реструктурирую данные из основного массива 
//// дполнительна предварительня структуризация вложенных объектов 
////  выстраиваю (почти) полную итоговую структуру ичитывая поля для данных которы будут заполнятся позже
////// при необходимости (в случае затруднения) переключаю на плоский вариант 
//// перерлбативать структуру не предвидиться 
//при необходимости редактировать копию данного файла





const fs = require('fs');

// Читаем оба файла
const rawData1 = fs.readFileSync('../JSON/b0f1_nike_fetchData.json', 'utf8');
const rawData2 = fs.readFileSync('../JSON/b7f7_nikeIMG.json', 'utf8'); // Укажите путь ко второму файлу
const rawData3 = fs.readFileSync('../JSON/b7f7_nike_discr_sizes.json', 'utf8'); // Укажите путь к третьему файлу
const rawData4 = fs.readFileSync('../JSON/b1f5_nike_prices_converted.json', 'utf8'); // Укажите путь к четвертому файлу

const products = JSON.parse(rawData1);
const secondData = JSON.parse(rawData2);
const thirdData = JSON.parse(rawData3);
const pricesData = JSON.parse(rawData4);

function destructureNestedObjects(products, secondData, thirdData, pricesData) {
    const destructuredProducts = products.map(product => {
        // Деструктурируем вложенные объекты
        const {
            groupKey,
            productCode,
            productType,
            productSubType,
            globalProductId,
            internalPid,
            merchProductId,
            copy = {},
            displayColors = [],
            prices = {},
            colorwayImages = {},
            pdpUrl = {},
            isNewUntil = {},
            promotions = {},
          //  customization = {},
            badgeAttribute = {},
            badgeLabel = {},
        } = product;

        const {
            title: name,
            subTitle: subtitle,
        } = copy;

        const {
            simpleColor = {},
            colorDescription,
        } = displayColors;

        const {
            label: labelColor,
            hex 
        } = simpleColor;

        const {
            currency,
            currentPrice,
            initialPrice,
        } = prices;

        const {
            portraitURL,
            squarishURL,
        } = colorwayImages;

        const {
            url,
            path
        } = pdpUrl;

        // const description = copy.description || '';

        // Находим соответствующий объект из второго файла по url
        const matchingSecondItem = secondData.find(secondItem => 
            secondItem.url === url
        );
        const matchingThirdItem = thirdData.find(thirdItem =>
            thirdItem.url === url
        );
        const matchingPricesItem = pricesData.find(pricesItem =>
            pricesItem.url === url
        );

        const priceData = {
            ...(matchingPricesItem && {
                self: { 
                    initial20: matchingPricesItem.self.initial20,
                    current20: matchingPricesItem.self.current20,
                },
                UAH: {
                    initialPrice: matchingPricesItem.UAH.initialPrice,
                    currentPrice: matchingPricesItem.UAH.currentPrice,
                },
                selfUAH: {
                    initial20: matchingPricesItem.selfUAH.initial20,
                    current20: matchingPricesItem.selfUAH.current20,
                },
            }),
        }

        const discriptionSizesData = {
            ...(matchingThirdItem && {
                discription: matchingThirdItem.content,
            }),
            ...(matchingThirdItem && {
                sizes: matchingThirdItem.contentDivSizes,
            }),
        }


        const { discription, sizes } = discriptionSizesData;
            
        
        // Создаем объект image с учетом данных из второго файла
        const imageData = {
            portraitURL,
            squarishURL,
            ...(matchingSecondItem && {
                imgMain: matchingSecondItem.imgMain,
                images: matchingSecondItem.imgs
            })
        };

        return {
            links: {
                url,
                path,
            },
            pid: {
                groupKey,
                internalPid,
                merchProductId,
                productCode,
                globalProductId,
            },
            data: {
                productType,
                productSubType,
            },
            info: {
                name,
                subtitle,
                discription,
                color: {
                    labelColor,
                    hex,
                    colorDescription,
                },
            },
            imageData: imageData,
            price: {
                origin: {
                    currency,
                    currentPrice,
                    initialPrice,
                    self: priceData.self,
                },
                self: {
                    currency: "UAH",
                    UAH: priceData.UAH,
                    selfUAH: priceData.selfUAH,
                },

                
            },
           sizes, 
            someAdditionalData: { 
                isNewUntil: isNewUntil || {},
                promotions: promotions || {}, 
              //  customization: customization || {},
                badgeAttribute: badgeAttribute || {}, 
                badgeLabel: badgeLabel || {},
            },
        };
    });

    return destructuredProducts;
}

// Выполняем деструктуризацию с учетом второго файла
const processedProducts = destructureNestedObjects(products, secondData, thirdData, pricesData);

// Сохраняем результат в новый файл
fs.writeFileSync('../JSON/b0f7_nike_structData.json', JSON.stringify(processedProducts, null, 2));
console.log('Обработанные данные сохранены в b0f7_nike_structData.json');
