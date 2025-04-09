const fs = require('fs');

async function mergeFiles() {
    try {
        // Список файлов для объединения
        const fileNames = [
            '../JSON/b4f6_nike_dicr_size.json',
            '../JSON/b1f1_discr_sizes_filtered.json',
        ];

        // Читаем все файлы параллельно
        const filesData = await Promise.all(
            fileNames.map(file => fs.promises.readFile(file, 'utf8').then(JSON.parse))
        );

        // Объединяем все массивы в один
        const combined = filesData.reduce((acc, curr) => [...acc, ...curr], []);

        // Записываем результат
        await fs.promises.writeFile('../JSON/b7f7_nike_discr_sizes.json', JSON.stringify(combined, null, 2));
        console.log('Все 5 файлов успешно объединены');
    } catch (error) {
        console.error('Ошибка при объединении файлов:', error);
    }
}

mergeFiles();
