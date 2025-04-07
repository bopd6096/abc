const fs = require('fs').promises;

async function findDuplicates(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        
        const urls = content.split('\n').filter(url => url.trim() !== '');
        
        const totalLines = urls.length;
        const uniqueUrls = new Set(urls);
        const uniqueCount = uniqueUrls.size;
        const duplicatesCount = totalLines - uniqueCount;
        
        console.log(`Общее количество строк: ${totalLines}`);
        console.log(`Уникальных строк: ${uniqueCount}`);
        console.log(`Количество дубликатов: ${duplicatesCount}`);
        
        if (duplicatesCount > 0) {
            const urlCountMap = new Map();
            
            urls.forEach(url => {
                urlCountMap.set(url, (urlCountMap.get(url) || 0) + 1);
            });
            
            console.log('\nДублирующиеся строки:');
            for (const [url, count] of urlCountMap) {
                if (count > 1) {
                    console.log(`${url} - встречается ${count} раз`);
                }
            }
        } else {
            console.log('Дубликатов не найдено');
        }
        
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

// Вариант 1: Путь к файлу прямо в коде
const fileToCheck = './b1f0_nike_product_urls.txt'; // Укажите здесь путь к вашему файлу
findDuplicates(fileToCheck);

// Вариант 2: Для запуска из командной строки (оставлен для гибкости)
if (process.argv.length === 3) {
    findDuplicates(process.argv[2]);
} else if (process.argv.length === 2) {
    // Если аргументов нет, используем путь из кода
    findDuplicates(fileToCheck);
} else {
    console.log('Использование: node duplicates.js [file.txt]');
}
