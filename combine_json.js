const fs = require('fs');

async function mergeFiles() {
    try {
        // Список файлов для объединения
        const fileNames = [
            // './test_b1f3_nike_discriptions.json',
            // './test2_b1f3_nike_discriptions.json',
            // './test3_b1f3_nike_discriptions.json'
        ];

        // Читаем все файлы параллельно
        const filesData = await Promise.all(
            fileNames.map(file => fs.promises.readFile(file, 'utf8').then(JSON.parse))
        );

        // Объединяем все массивы в один
        const combined = filesData.reduce((acc, curr) => [...acc, ...curr], []);

        // Записываем результат
        // await fs.promises.writeFile('nike_discr_sizes.json', JSON.stringify(combined, null, 2));
        console.log('Все 5 файлов успешно объединены');
    } catch (error) {
        console.error('Ошибка при объединении файлов:', error);
    }
}

mergeFiles();
