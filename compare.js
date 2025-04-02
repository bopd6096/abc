const fs = require('fs').promises;
const path = require('path');

async function compareUrlFiles(file1Path, file2Path, outputDir = 'comparsion_results' ) {
    try {
        const outputPath = path.join(process.cwd(), outputDir);
        await fs.mkdir(outputPath, { recursive: true });

        // Читаем файлы и преобразуем их в массивы строк
        const file1Content = await fs.readFile(file1Path, 'utf8');
        const file2Content = await fs.readFile(file2Path, 'utf8');
        
        // Разбиваем содержимое на массивы и убираем пустые строки
        const urls1 = file1Content.split('\n').filter(url => url.trim() !== '');
        const urls2 = file2Content.split('\n').filter(url => url.trim() !== '');
        
        // Преобразуем в Set для эффективного сравнения
        const set1 = new Set(urls1);
        const set2 = new Set(urls2);
        
        // Подсчитываем статистику
        const totalFile1 = urls1.length;
        const totalFile2 = urls2.length;
        
        // Находим совпадения
        const matches = [...set1].filter(url => set2.has(url));
        
        // Находим уникальные для file1
        const onlyInFile1 = [...set1].filter(url => !set2.has(url));
        
        // Находим уникальные для file2
        const onlyInFile2 = [...set2].filter(url => !set1.has(url));
        
        // Выводим статистику в консоль
        console.log(`Количество ссылок в файле 1: ${totalFile1}`);
        console.log(`Количество ссылок в файле 2: ${totalFile2}`);
        console.log(`Количество совпадений: ${matches.length}`);
        console.log(`Ссылок в файле 1, которых нет в файле 2: ${onlyInFile1.length}`);
        console.log(`Ссылок в файле 2, которых нет в файле 1: ${onlyInFile2.length}`);
        
        // Создаем результирующие файлы
        // 1. file1 + уникальные из file2
        const combined = [...urls1, ...onlyInFile2].join('\n');
        await fs.writeFile(path.join(outputPath, 'combined.txt'), combined);
        
        // 2. Совпадения
        await fs.writeFile(path.join(outputPath, 'matches.txt'), matches.join('\n'));
        
        // 3. Только в file1
        await fs.writeFile(path.join(outputPath, 'only_file1.txt'), onlyInFile1.join('\n'));
        
        // 4. Только в file2
        await fs.writeFile(path.join(outputPath, 'only_file2.txt'), onlyInFile2.join('\n'));
        const matchesPlusFile2Unique = [...matches, ...onlyInFile2].join('\n');
        await fs.writeFile(path.join(outputPath, 'matches_plus_file2_unique.txt'), matchesPlusFile2Unique);
        
        console.log('Результирующие файлы успешно созданы');
        
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

// Пример использования
// compareUrlFiles('file1.txt', 'file2.txt');
// Добавьте это в конец файла для запуска из командной строки
if (process.argv.length === 4) {
    compareUrlFiles(process.argv[2], process.argv[3]);
} else if (process.argv.length === 5) {
    compareUrlFiles(process.argv[2], process.argv[3], process.argv[4]);
} else {
    console.log('Использование: node compare.js file1.txt file2.txt [output_directory]');
}



// if (process.argv.length === 4) {
//     compareUrlFiles(process.argv[2], process.argv[3]);
// } else {
//     console.log('Использование: node compare.js file1.txt file2.txt');
// }
