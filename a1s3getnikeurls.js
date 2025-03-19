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
extractUrlsFromJson('b1f2_nike_pre_proces.json', 'links', 'url', 'b1f0_nike_product_urls.txt');
// или
// extractUrlsFromJsonAsync('input.json', 'data', 'url', 'output.txt');
