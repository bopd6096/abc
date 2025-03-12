const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const fs = require('fs-extra');
require('dotenv').config();

MONGO_URL = process.env.MONGO_URL;
// Подключение к MongoDB
mongoose.connect('mongodb+srv://drankovladik14:Batat995@cluster0.bwidc.mongodb.net/ABC?retryWrites=true&w=majority&appName=cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('📦 Подключение к MongoDB успешно!'))
    .catch(err => console.log('❌ Ошибка подключения к MongoDB:', err));

// Определение схемы для MongoDB
const productSchema = new mongoose.Schema({
    name: String,
    price: String,
    link: String,
    image: String,
    description: String,
    brand: String,
    material: String,
    sku: String,
    availability: String,
    category: String
});

const Product = mongoose.model('Product', productSchema);

const BASE_URL = 'https://answear.ua/';
const OUTPUT_FILE = 'products.json';
const ALLOWED_BRANDS = ['Nike', 'Adidas', 'Puma', 'Reebok']; // Список брендов для фильтрации

// Получаем категории сайта
async function getCategories() {
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    const categories = [];

    $('.menu-category a').each((i, el) => {
        categories.push({
            name: $(el).text().trim(),
            link: $(el).attr('href')
        });
    });

    return categories;
}

// Получаем все товары на странице категории
async function getProductsFromCategory(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];

    $('.product-card').each((i, el) => {
        const name = $(el).find('.product-name').text().trim();
        const price = $(el).find('.product-price').text().trim();
        const link = $(el).find('a').attr('href');
        const image = $(el).find('.product-image img').attr('src');

        products.push({ name, price, link, image });
    });

    return products;
}

// Получаем детализированную информацию о товаре
async function getProductDetails(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const description = $('.product-description').text().trim();
    const brand = $('.brand-name').text().trim();
    const material = $('.product-material').text().trim();
    const sku = $('.product-sku').text().trim();
    const availability = $('.product-availability').text().trim();

    return { description, brand, material, sku, availability };
}

// Сохранение товара в базу данных MongoDB
async function saveProductToDatabase(product, category) {
    const newProduct = new Product({
        name: product.name,
        price: product.price,
        link: product.link,
        image: product.image,
        description: product.description,
        brand: product.brand,
        material: product.material,
        sku: product.sku,
        availability: product.availability,
        category: category
    });

    try {
        await newProduct.save();
        console.log(`✅ Товар ${product.name} сохранен в базу данных.`);
    } catch (err) {
        console.log(`❌ Ошибка сохранения товара ${product.name}:`, err);
    }
}

// Сохранение данных в JSON
async function saveDataToJson(data) {
    try {
        await fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ Данные сохранены в ${OUTPUT_FILE}`);
    } catch (err) {
        console.log(`❌ Ошибка сохранения данных в JSON:`, err);
    }
}

// Главная функция для обработки категорий и товаров
async function main() {
    const categories = await getCategories();
    let allData = [];

    for (let category of categories) {
        console.log(`📂 Парсим категорию: ${category.name}`);

        const products = await getProductsFromCategory(category.link);

        for (let product of products) {
            console.log(`🔍 Парсим товар: ${product.link}`);
            const details = await getProductDetails(product.link);
            Object.assign(product, details);

            // Фильтрация по бренду
            if (ALLOWED_BRANDS.includes(product.brand)) {
                await saveProductToDatabase(product, category.name);
            }
        }

        allData.push({ category: category.name, products });
    }

    // Сохраняем данные в JSON
    await saveDataToJson(allData);

    // Завершаем подключение к MongoDB
    mongoose.connection.close();
}

main();
