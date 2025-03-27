const fs = require('fs');

const inputFile = './b1f0_nike_product_urls.txt'; // Исходный файл
const numParts = 6; // Количество частей

// Читаем файл
fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }

    const links = data.split('\n').filter(link => link.trim()); // Разделяем по строкам и убираем пустые строки
    const chunkSize = Math.ceil(links.length / numParts); // Определяем размер одной части

    for (let i = 0; i < numParts; i++) {
        const partLinks = links.slice(i * chunkSize, (i + 1) * chunkSize).join('\n'); // Берем часть ссылок
        const outputFile = `links_part_${i + 1}.txt`; // Имя выходного файла

        fs.writeFile(outputFile, partLinks, 'utf8', err => {
            if (err) console.error(`Ошибка записи файла ${outputFile}:`, err);
            else console.log(`Создан файл: ${outputFile}`);
        });
    }
});
