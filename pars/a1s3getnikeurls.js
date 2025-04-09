///// получаю ссылку каждого товара в текстового списка






const fs = require('fs');

// Синхронная версия
function extractUrlsFromJson(jsonFilePath, objectKey, urlKey, outputFilePath) {
    try {
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const array = JSON.parse(jsonData);
        
        // Извлекаем URL из вложенного объекта
        const urls = array.map(item => item[objectKey][urlKey]);
        
        const content = urls.join('\n');
        fs.writeFileSync(outputFilePath, content, 'utf8');
        
        console.log(`URL успешно записаны в ${outputFilePath}`);
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

// // Асинхронная версия
// const fsPromises = require('fs').promises;
//
// async function extractUrlsFromJsonAsync(jsonFilePath, objectKey, urlKey, outputFilePath) {
//     try {
//         const jsonData = await fsPromises.readFile(jsonFilePath, 'utf8');
//         const array = JSON.parse(jsonData);
//         
//         const urls = array.map(item => item[objectKey][urlKey]);
//         const content = urls.join('\n');
//         
//         await fsPromises.writeFile(outputFilePath, content, 'utf8');
//         console.log(`URL успешно записаны в ${outputFilePath}`);
//     } catch (error) {
//         console.error('Ошибка:', error.message);
//     }
// }

// Пример использования
extractUrlsFromJson('../JSON/b0f3_nike_structData.json', 'links', 'url', '../JSON/b0f0_nike_urls.txt');
// или
// extractUrlsFromJsonAsync('input.json', 'data', 'url', 'output.txt');
