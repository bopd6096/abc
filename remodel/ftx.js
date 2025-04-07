const puppeteer = require("puppeteer");
const fs = require("fs");

const urlsFile = "./exemeple.txt";

async function fetchAnalyticsData(urls) {
    const browser = await puppeteer.launch({
        executablePath: "/snap/bin/chromium", // Укажи свой путь, если нужно
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const results = [];

    for (const url of urls) {
        const page = await browser.newPage();

        try {
            console.log(`Открываю страницу: ${url}`);

            // Логируем все запросы
            page.on("request", (request) => {
                console.log("Запрос:", request.url());
            });

            // Перехватываем ответ
            const responsePromise = new Promise((resolve) => {
                page.on("response", async (response) => {
                    const requestUrl = response.url();

                    if (requestUrl.includes("https://answear.ua/api/product")) {
                        try {
                            const jsonResponse = await response.json();
                            results.push(jsonResponse);
                            console.log(`Получены данные с ${requestUrl}:`, jsonResponse);
                            resolve();
                        } catch (err) {
                            console.error(`Ошибка парсинга JSON от ${requestUrl}:`, err);
                            resolve();
                        }
                    }
                });
            });

            // Загружаем страницу и ждем ответа
            await page.goto(url, { waitUntil: "networkidle2" });
            await responsePromise; // Ожидаем, пока не придет ответ

        } catch (error) {
            console.error(`Ошибка при обработке URL: ${url}`, error);
        } finally {
            await page.close();
        }
    }

    await browser.close();

    // Записываем результат в файл data.json
    const jsonData = JSON.stringify(results, null, 2);
    fs.writeFileSync("answeardata.json", jsonData, "utf8");

    console.log("✅ Данные сохранены в data.json");

    return results;
}

// read urls from file
const urls = fs.readFileSync(urlsFile, "utf8").split("\n").filter(Boolean);


// Список страниц
// const urls = [
    // "https://answear.ua/p/viking-rukavychky-2873",
    // "https://answear.ua/p/another-product-1234",
// ];

fetchAnalyticsData(urls)
    .then((data) => console.log("Все полученные данные сохранены."))
    .catch((error) => console.error("Ошибка при получении данных:", error));
