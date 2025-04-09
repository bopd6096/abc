const fs = require('fs').promises; // Используем промисы для асинхронной работы с файлами

// Функция для объединения массивов
async function mergeJsonFiles(file1Path, file2Path, outputPath) {
    try {
        // Читаем оба файла
        const firstFileContent = await fs.readFile(file1Path, 'utf8');
        const secondFileContent = await fs.readFile(file2Path, 'utf8');

        // Парсим JSON в объекты
        const firstArray = JSON.parse(firstFileContent);
        const secondArray = JSON.parse(secondFileContent);

        // Объединяем массивы
        const mergedArray = firstArray.map(firstItem => {
            const matchingSecondItem = secondArray.find(secondItem => 
                secondItem.url === firstItem.links.url
            );

            if (matchingSecondItem) {
                return {
                    ...firstItem,
                    info: {
                        ...firstItem.info,
                        image: {
                            ...firstItem.info.image,
                            imgMain: matchingSecondItem.imgMain,
                            imgs: matchingSecondItem.imgs
                        }
                    }
                };
            }
            
            return firstItem;
        });

        // Сохраняем результат в новый файл
        await fs.writeFile(
            outputPath,
            JSON.stringify(mergedArray, null, 2), // null, 2 для красивого форматирования
            'utf8'
        );

        console.log('Файлы успешно объединены и сохранены в', outputPath);
        return mergedArray;

    } catch (error) {
        console.error('Ошибка при обработке файлов:', error);
        throw error;
    }
}

// Пример использования
async function main() {
    try {
        await mergeJsonFiles(
            './JSON/b0f2_nike_structData.json',    // путь к первому файлу
            './JSON/b3f2_nikeIMG.json',   // путь к второму файлу
            './merged.json'    // путь для сохранения результата
        );
    } catch (error) {
        console.error('Ошибка в main:', error);
    }
}

main();
