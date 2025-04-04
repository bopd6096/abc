const fs = require('fs');

async function mergeFiles() {
    try {
        // Список файлов для объединения
        const fileNames = [
            './b3f1_nikeIMG.json',
            './b3f2_nikeIMG.json',
            './b3f3_nikeIMG.json',
            './b3f4_nikeIMG.json',
            './b3f5_nikeIMG.json',
            './b3f6_nikeIMG.json'
        ];

        // Читаем все файлы параллельно
        const filesData = await Promise.all(
            fileNames.map(file => fs.promises.readFile(file, 'utf8').then(JSON.parse))
        );

        // Объединяем все массивы в один
        const combined = filesData.reduce((acc, curr) => [...acc, ...curr], []);

        // Записываем результат
        await fs.promises.writeFile('nike_imgs.json', JSON.stringify(combined, null, 2));
        console.log('Все 5 файлов успешно объединены');
    } catch (error) {
        console.error('Ошибка при объединении файлов:', error);
    }
}

mergeFiles();
