const fs = require('fs').promises;

function normalizeUrl(url) {
    return url.trim().toLowerCase();
}

async function filterObjectsByUrls(jsonFilePath, urlsFilePath, outputFilePath) {
    try {
        // Читаем файлы
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
        const objectsArray = JSON.parse(jsonData);
        
        const urlsData = await fs.readFile(urlsFilePath, 'utf8');
        const urlsArray = urlsData.split('\n').filter(url => url.trim() !== '');
        const urlsSet = new Set(urlsArray.map(normalizeUrl));

        console.log('URL-ы из текстового файла:', Array.from(urlsSet));

        // Фильтруем массив
        const filteredArray = objectsArray.filter(obj => {
            if (!obj.url) {
                console.log('Объект без url:', obj);
                return true;
            }

            const objUrl = normalizeUrl(obj.url);
            const shouldKeep = !urlsSet.has(objUrl);
            
            if (!shouldKeep) {
                console.log('Удаляется объект с URL:', objUrl);
            }
            
            return shouldKeep;
        });

        // Записываем результат
        await fs.writeFile(
            outputFilePath,
            JSON.stringify(filteredArray, null, 2),
            'utf8'
        );

        console.log(`Исходное количество объектов: ${objectsArray.length}`);
        console.log(`Оставшееся количество объектов: ${filteredArray.length}`);
        console.log(`Удалено объектов: ${objectsArray.length - filteredArray.length}`);

    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

// Использование
const jsonFilePath = '../JSON_default/b1f2_nike_discr_sizes.json';
const urlsFilePath = '../compare/only_file1.txt';

const outputFilePath = '../JSON/b1f1_discr_sizes_filtered.json';

filterObjectsByUrls(jsonFilePath, urlsFilePath, outputFilePath);
