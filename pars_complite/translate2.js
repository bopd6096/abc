const fs = require('fs').promises;
const { createReadStream, createWriteStream } = require('fs');
const { OpenAI } = require('openai');
const JSONStream = require('jsonstream');
const stream = require('stream');
const ProgressBar = require('progress'); // Подключаем библиотеку progress

// Функция перевода с повторными попытками
async function translateWithRetry(openai, text, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Ты профессиональный маркетинговый копирайтер и переводчик. Твоя задача — переводить рекламные и промо-тексты с английского на Украинский  язык не дословно, а адаптированно, в маркетинговом стиле.\n\nСохраняй ключевые смыслы и преимущества продукта, но переформулируй фразы так, чтобы они звучали естественно, живо и привлекательно для Украиноязычной аудитории.\n\nСтиль — современный, лёгкий, вдохновляющий, с эмоциональным акцентом на свободу, комфорт, стиль и качество.\n\nИзбегай канцеляризмов и дословных конструкций. Используй короткие, выразительные предложения, подходящие для рекламы. Допускается лёгкое переосмысление текста для усиления привлекательности.\n\nДобавляй заголовок (если его нет) и делай текст пригодным для карточки товара, баннера или рекламной вставки.",
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });
            return response.choices[0].message.content;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Попытка ${i + 1} не удалась для "${text}", повтор через ${delay}мс:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Ограничение параллельных задач
function createLimiter(maxConcurrent) {
    let running = 0;
    const queue = [];

    async function runTask(task) {
        if (running >= maxConcurrent) {
            await new Promise(resolve => queue.push(resolve));
        }
        running++;
        try {
            return await task();
        } finally {
            running--;
            if (queue.length > 0) {
                queue.shift()();
            }
        }
    }

    return task => runTask(task);
}

async function translateContent(inputFilePath, outputFilePath) {
    const openai = new OpenAI({
        apiKey: '', // Замените на ваш API ключ
    });

    const limit = createLimiter(15); // Ограничиваем до 15 параллельных запросов


    // Считаем общее количество элементов в файле
    const fileContent = await fs.readFile(inputFilePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    const totalItems = jsonData.length;

    // Инициализируем прогресс-бар
    const bar = new ProgressBar('Перевод [:bar] :percent (:current/:total) ETA: :etas', {
        total: totalItems,
        width: 50,
        complete: '█',
        incomplete: '…',
        clear: true
    });

    // Создаем потоки для чтения и записи
    const inputStream = createReadStream(inputFilePath, { encoding: 'utf8' });
    const outputStream = createWriteStream(outputFilePath, { encoding: 'utf8' });

    // Настраиваем потоковую обработку JSON
    const parser = JSONStream.parse('*'); // Парсим каждый элемент массива
    let isFirst = true;

    // Начало массива в выходном файле
    outputStream.write('[');

    const transformStream = new stream.Transform({
        objectMode: true,
        async transform(item, encoding, callback) {
            try {
                const translatedText = await limit(() => translateWithRetry(openai, item.content));
                const result = {
                    url: item.url,
                    content: item.content,
                    translate: translatedText
                };

                // Форматируем вывод
                const jsonString = JSON.stringify(result, null, 2);
                if (!isFirst) {
                    outputStream.write(',\n');
                } else {
                    isFirst = false;
                }
                outputStream.write(jsonString);

                // Обновляем прогресс-бар
                bar.tick();

                callback();
            } catch (error) {
                callback(error);
            }
        },
        final(callback) {
            outputStream.write(']');
            outputStream.end();
            console.log('\nОбработка завершена.');
            callback();
        }
    });

    return new Promise((resolve, reject) => {
        inputStream
            .pipe(parser)
            .pipe(transformStream)
            .on('error', (error) => {
                console.error('Ошибка в потоке:', error);
                reject(error);
            })
            .on('finish', () => resolve());
    });
}

// Использование
const inputFile = '../JSON/b1f4_nike_discription.json'; // Путь к вашему входному файлу
const outputFile = '../JSON/b1f3_nike_discription_translated.json'; // Путь к вашему выходному файлу

translateContent(inputFile, outputFile)
    .then(() => console.log('Перевод завершен'))
    .catch(err => console.error('Произошла ошибка:', err));
