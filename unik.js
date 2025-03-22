const fs = require('fs');

function analyzeLinks(filePath) {
    try {
        // Читаем файл синхронно
        const text = fs.readFileSync(filePath, 'utf8');
        const links = text.split('\n').filter(link => link.trim() !== '');
        const linkCount = new Map();
        
        // Подсчет повторений
        links.forEach(link => {
            linkCount.set(link, (linkCount.get(link) || 0) + 1);
        });
        
        // Преобразование в массив и сортировка по убыванию количества
        const sortedLinks = Array.from(linkCount.entries())
            .sort((a, b) => b[1] - a[1]);
        
        // Вывод результатов
        console.log('Статистика ссылок:');
        sortedLinks.forEach(([link, count]) => {
            if (count > 1) {
                console.log(`${count} раз - ${link}`);
            }
        });
        
        console.log(`Всего ссылок: ${links.length}`);
        console.log(`Уникальных ссылок: ${linkCount.size}`);
        console.log(`Повторяющихся ссылок: ${sortedLinks.filter(([_, count]) => count > 1).length}`);
        
        return sortedLinks;
    } catch (error) {
        console.error('Ошибка при чтении файла:', error.message);
    }
}

// Пример использования
analyzeLinks('./b1f0_nike_product_urls.txt');
