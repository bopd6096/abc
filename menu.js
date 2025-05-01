const { fromPath } = require('pdf2pic');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;

async function pdfToText(pdfPath, outputTextFile) {
    try {
        // Настройки для pdf2pic
        const options = {
            density: 300, // Увеличьте для лучшего качества OCR
            format: 'png',
            outputDir: './output',
            outputName: 'page'
        };

        // Конвертация PDF в изображения
        const convert = fromPath(pdfPath, options);
        const pages = await convert.bulk(-1); // Конвертировать все страницы
        console.log(`Конвертировано ${pages.length} страниц`);

        let fullText = '';

        // OCR для каждого изображения
        for (let i = 1; i <= pages.length; i++) {
            const imagePath = `./output/page.${i}.png`;
            console.log(`Обработка страницы ${i}...`);
            const { data: { text } } = await Tesseract.recognize(imagePath, 'rus+eng', {
                logger: m => console.log(m) // Логирование прогресса
            });
            if (text.trim()) {
                fullText += `Страница ${i}:\n${text}\n\n`;
            } else {
                console.log(`Текст на странице ${i} не распознан`);
            }
        }

        // Проверка результата
        if (!fullText.trim()) {
            console.log('Текст не распознан. Проверьте качество PDF или язык OCR.');
            return;
        }

        // Сохранение текста
        await fs.writeFile(outputTextFile, fullText);
        console.log(`Текст сохранен в ${outputTextFile}`);
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

// Использование
pdfToText('input.pdf', 'output.txt');
