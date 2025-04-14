// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shop';

// Подключение к MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Модель продукта
const productSchema = require('./model.js');
const Product = mongoose.model('Products', productSchema);

const app = express();

// Настройка middleware
app.use(express.static(path.join(__dirname, './product_page')));

// Главная страница
app.get('/w', (req, res) => {
    res.sendFile(path.join(__dirname, 'product_page', 'index.html'));
});

// API endpoint для получения продуктов
app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, minPrice, maxPrice, productType, color, isNew } = req.query;

        let query = {};
        if (search) {
            query['info.name'] = { $regex: search, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            query['price.self.selfUAH.current20'] = {};
            if (minPrice) {
                query['price.self.selfUAH.current20'].$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query['price.self.selfUAH.current20'].$lte = parseFloat(maxPrice);
            }
        }
        if (productType) {
            query['data.productType'] = productType;
        }
        if (color) {
            query['info.color.labelColor'] = color;
        }
        if (isNew === 'true') {
            query['someAdditionalData.isNewUntil'] = { $gte: new Date() };
        }

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .select('info.name info.subtitle price.self.selfUAH imageData.portraitURL info.color.labelColor data.productType');

        const total = await Product.countDocuments(query);

        res.json({
            products,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit) || 1
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Обработка всех остальных маршрутов - отдаем index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'product_page', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
