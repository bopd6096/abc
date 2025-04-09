////// реструктурирую данные из основного массива 
//// дполнительна предварительня структуризация вложенных объектов 
////  выстраиваю (почти) полную итоговую структуру ичитывая поля для данных которы будут заполнятся позже
////// при необходимости (в случае затруднения) переключаю на плоский вариант 
//// перерлбативать структуру не предвидиться 
//при необходимости редактировать копию данного файла





const fs = require('fs');
const { hasUncaughtExceptionCaptureCallback } = require('process');

// Читаем файл
const rawData = fs.readFileSync('../JSON/b0f1_nike_fetchData.json', 'utf8');
const products = JSON.parse(rawData);

function destructureNestedObjects(products) {
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
            copy = {},              // Значение по умолчанию - пустой объект
            displayColors = [],     // Значение по умолчанию - пустой массив
            prices = {},           // Значение по умолчанию - пустой объект
            colorwayImages = {},   // Значение по умолчанию - пустой объект
            pdpUrl = {},           // Значение по умолчанию - пустой объект
             isNewUntil = {},
             promotions = {},
             customization = {},
             badgeAttribute = {},
             badgeLabel = {},

        } = product;

        // Деструктурируем поля из вложенных объектов
        const {
            title: name,
            subTitle: subtitle, // Значение по умолчанию - пустая строка
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
            // employeePrice,
            initialPrice,
            // discountPercentage,
            // employeeDiscountPercentaged
        } = prices;

        const {
            portraitURL,
            squarishURL,
        } = colorwayImages;

        const {
            url,
            path
        } = pdpUrl;



        const description = copy.description || '';
        // Возвращаем новый объект с плоской структурой



        return {
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
                description,
                color: {
                    labelColor,
                    hex,
                    colorDescription,
                },
                image: {
                    portraitURL,
                    squarishURL,
                    images: {},
                },
            },
            price: {
                    origin: {
                        currency,
                        currentPrice,
                        // employeePrice,
                        initialPrice,
                        // discountPercentage,
                        // employeeDiscountPercentaged,
                    },
                    self: {
                        fullPrice : '',
                        UAH : '',
                        },
            },
            links: {
                url,
                path,
            },

            someAdditionalData: { 
                isNewUntil: isNewUntil || {},
                        promotions: promotions || {}, 
                        customization: customization || {},
                        badgeAttribute: badgeAttribute || {}, 
                        badgeLabel: badgeLabel || {},
            },




        };


        // return {
        ////     groupKey,
        ////     productCode,
        ////     productType,
        ////     productSubType,
        ////     globalProductId,
        ////     internalPid,
        ////     merchProductId,
        ////     name,
        ////     description,
        ////     subtitle,
        //     currency,
        //     currentPrice,
        //     employeePrice,
        //     initialPrice,
        //     discountPercentage,
        //     employeeDiscountPercentaged,
        ////     portraitURL,
        ////     squarishURL,
        ////     url,
        ////     path,
        ////     labelColor,
        ////     hex,
        ////     colorDescription,
        // };
    });

    return destructuredProducts;
}

// Выполняем деструктуризацию
const processedProducts = destructureNestedObjects(products);

// Сохраняем результат в новый файл
fs.writeFileSync('../JSON/b0f3_nike_structData.json', JSON.stringify(processedProducts, null, 2));
console.log('Обработанные данные сохранены в nike_processed.json');
