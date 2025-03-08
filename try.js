const fetch = require('node-fetch').default;
const xml2js = require('xml2js');

// Функция для загрузки sitemap по URL
async function fetchSitemap(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки ${url}: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Ошибка при загрузке ${url}: ${error}`);
        return null;
    }
}

// Функция для парсинга XML-содержимого sitemap
async function parseSitemap(xmlContent) {
    const parser = new xml2js.Parser({ explicitArray: false });
    try {
        const result = await parser.parseStringPromise(xmlContent);
        // Если это набор URL-адресов (urlset)
        if (result.urlset) {
            let urls = [];
            if (result.urlset.url) {
                urls = Array.isArray(result.urlset.url)
                    ? result.urlset.url.map(item => item.loc)
                    : [result.urlset.url.loc];
            }
            return { urls, isIndex: false };
        }
        // Если это индекс sitemap (sitemapindex)
        else if (result.sitemapindex) {
            let sitemapUrls = [];
            if (result.sitemapindex.sitemap) {
                sitemapUrls = Array.isArray(result.sitemapindex.sitemap)
                    ? result.sitemapindex.sitemap.map(item => item.loc)
                    : [result.sitemapindex.sitemap.loc];
            }
            return { urls: sitemapUrls, isIndex: true };
        } else {
            console.error('Неизвестный формат sitemap.');
            return { urls: [], isIndex: false };
        }
    } catch (error) {
        console.error(`Ошибка парсинга XML: ${error}`);
        return { urls: [], isIndex: false };
    }
}

// Основная функция обхода sitemap
async function crawlSitemap(url) {
    const xmlContent = await fetchSitemap(url);
    if (!xmlContent) return [];

    const { urls, isIndex } = await parseSitemap(xmlContent);
    let allUrls = [];

    // Если sitemap является индексом, обходим вложенные sitemap
    if (isIndex) {
        for (const sitemapUrl of urls) {
            console.log(`Загружаем вложенный sitemap: ${sitemapUrl}`);
            const subXml = await fetchSitemap(sitemapUrl);
            if (subXml) {
                const { urls: subUrls } = await parseSitemap(subXml);
                allUrls = allUrls.concat(subUrls);
            }
        }
    } else {
        allUrls = urls;
    }
    return allUrls;
}

// Запуск обхода
(async () => {
    const sitemapUrl = "https://answear.ua/sitemap.xml";
    const pages = await crawlSitemap(sitemapUrl);
    console.log("Найденные URL-адреса:");
    pages.forEach(url => console.log(url));
})();
