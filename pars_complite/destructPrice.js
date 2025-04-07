const fs = require('fs').promises;

async function destructureJson(inputFilePath, outputFilePath) {
    try {
        // Читаем исходный JSON файл
        const rawData = await fs.readFile(inputFilePath, 'utf8');
        const jsonData = JSON.parse(rawData);

        // Деструктурируем и оставляем только url и content
        const destructuredData = jsonData.map(product => {

        const {
            prices = {},           // Значение по умолчанию - пустой объект
            pdpUrl = {},           // Значение по умолчанию - пустой объект
        } = product;
        const {
            url = {},           // Значение по умолчанию - пустой объект
        } = pdpUrl;
        const {
            initialPrice = {},
            currentPrice = {},
        } = prices;


            

        return {
            url,
            prices: {
                initialPrice: initialPrice,
                currentPrice: currentPrice,
            },
        };
        });

        // Записываем результат в новый файл
        await fs.writeFile(
            outputFilePath,
            JSON.stringify(destructuredData, null, 2),
            'utf8'
        );
        
        console.log('Файл успешно обработан и сохранен');
        return destructuredData;

    } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        throw error;
    }
}
    
// Пример использования
const inputFile = '../JSON/b0f1_nike_fetchData.json';
const outputFile = '../JSON/b1f3_nike_prices.json';

destructureJson(inputFile, outputFile)
    .then(() => console.log('Обработка завершена'))
    .catch(err => console.error('Произошла ошибка:', err));
