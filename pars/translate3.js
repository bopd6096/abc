const fs = require('fs').promises;
const { createReadStream, createWriteStream } = require('fs');
const { OpenAI } = require('openai');
const JSONStream = require('jsonstream');
const stream = require('stream');
const ProgressBar = require('progress');

// Кэш для переводов
const translationCache = new Map();

// Функция перевода с повторными попытками (пакетная версия)
async function translateBatchWithRetry(openai, texts, retries = 3, delay = 1000) {
    const cachedResults = texts.map(text => translationCache.get(text) || null);
    const textsToTranslate = texts.filter((_, i) => !cachedResults[i]);

    if (textsToTranslate.length === 0) {
        return cachedResults; // Все тексты уже в кэше
    }

    for (let i = 0; i < retries; i++) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Ты профессиональный маркетинговый копирайтер и переводчик. Твоя задача — переводить рекламные и промо-тексты с английского на Украинский язык не дословно, а адаптированно, в маркетинговом стиле.\n\nСохраняй ключевые смыслы и преимущества продукта, но переформулируй фразы так, чтобы они звучали естественно, живо и привлекательно для Украиноязычной аудитории.\n\nСтиль — современный, лёгкий, вдохновляющий, с эмоциональным акцентом на свободу, комфорт, стиль и качество.\n\nИзбегай канцеляризмов и дословных конструкций. Используй короткие, выразительные предложения, подходящие для рекламы. Допускается лёгкое переосмысление текста для усиления привлекательности.\n\nДобавляй заголовок (если его нет) и делай текст пригодным для карточки товара, баннера или рекламной вставки.\n\nТы получаешь массив текстов. Переведи каждый элемент массива и верни массив переводов в том же порядке.",
                    },
                    {
                        role: "user",
                        content: JSON.stringify(textsToTranslate)
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000 // Увеличиваем лимит токенов для пакетной обработки
            });

            const translatedTexts = JSON.parse(response.choices[0].message.content);
            textsToTranslate.forEach((text, idx) => translationCache.set(text, translatedTexts[idx]));
            
            let resultIndex = 0;
            return texts.map((text, i) => cachedResults[i] || translatedTexts[resultIndex++]);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Попытка ${i + 1} не удалась для пакета, повтор через ${delay}мс:`, error.message);
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
        
        apiKey: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', // Замените на ваш API ключ
    });

    const limit = createLimiter(50); // Увеличиваем до 50 параллельных задач
    const batchSize = 5; // Обрабатываем по 10 текстов за раз

    // Подсчитываем общее количество элементов
    const fileContent = await fs.readFile(inputFilePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    const totalItems = jsonData.length;

    // Инициализируем прогресс-бар
    const bar = new ProgressBar('Перевод [:bar] :percent (:current/:total) ETA: :etas', {
        total: totalItems,
        width: 60,
        complete: '█',
        incomplete: '…',
        clear: true
    });

    // Создаем потоки
    const inputStream = createReadStream(inputFilePath, { encoding: 'utf8' });
    const outputStream = createWriteStream(outputFilePath, { encoding: 'utf8' });

    const parser = JSONStream.parse('*');
    let isFirst = true;
    outputStream.write('[');

    let batch = [];
    const transformStream = new stream.Transform({
        objectMode: true,
        async transform(item, encoding, callback) {
            batch.push(item);

            if (batch.length >= batchSize) {
                try {
                    const texts = batch.map(i => i.content);
                    const translatedTexts = await limit(() => translateBatchWithRetry(openai, texts));
                    
                    for (let i = 0; i < batch.length; i++) {
                        const result = {
                            url: batch[i].url,
                            content: batch[i].content,
                            translate: translatedTexts[i]
                        };
                        const jsonString = JSON.stringify(result, null, 2);
                        if (!isFirst) outputStream.write(',\n');
                        else isFirst = false;
                        outputStream.write(jsonString);
                        bar.tick();
                    }
                    batch = [];
                    callback();
                } catch (error) {
                    callback(error);
                }
            } else {
                callback();
            }
        },
        async flush(callback) {
            if (batch.length > 0) {
                const texts = batch.map(i => i.content);
                const translatedTexts = await limit(() => translateBatchWithRetry(openai, texts));
                
                for (let i = 0; i < batch.length; i++) {
                    const result = {
                        url: batch[i].url,
                        content: batch[i].content,
                        translate: translatedTexts[i]
                    };
                    const jsonString = JSON.stringify(result, null, 2);
                    if (!isFirst) outputStream.write(',\n');
                    else isFirst = false;
                    outputStream.write(jsonString);
                    bar.tick();
                }
            }
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
const inputFile = '../JSON/b1f4_nike_discription.json';
const outputFile = '../JSON/b1f3_nike_discription_translated.json';

translateContent(inputFile, outputFile)
    .then(() => console.log('Перевод завершен'))
    .catch(err => console.error('Произошла ошибка:', err));
