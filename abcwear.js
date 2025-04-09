const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
 
require('dotenv').config(); 

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    console.log('GET request to /');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/w', (req, res) => {
    console.log('GET request to /w');
    res.sendFile(path.join(__dirname, 'public', 'test9.html'));
});


 mongoose.connect(MONGO_URI)      
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));

// import { productSchema } from './model.js';
const productSchema = require('./model.js');
const Products = mongoose.model('Products', productSchema);



app.get('/api/filters/colors', async (req, res) => {
  try {
    const colors = await Products.distinct('info.color.labelColor', { 'info.color.labelColor': { $exists: true } });
    res.json(colors.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.get('/api/filters/categories', async (req, res) => {
  try {
    const categories = await Products.distinct('data.productType', { 'data.productType': { $exists: true } });
    res.json(categories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.get('/api/filters/names', async (req, res) => {
  try {
    const names = await Products.distinct('info.name', { 'info.name': { $exists: true } });
    res.json(names.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});


app.get('/api/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const color = req.query.color;
  const category = req.query.category;
  const search = req.query.search;

  console.log(`GET /api/products - Page: ${page}, Limit: ${limit}, Skip: ${skip}, Color: ${color}, Category: ${category}, Search: ${search}`);

  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    console.log('MongoDB connection is active');

    // Создаем фильтр для агрегации
    const filter = { 'pid.groupKey': { $exists: true } };
    if (color) filter['info.color.labelColor'] = { $regex: new RegExp(color, 'i') };
    if (category) filter['data.productType'] = { $regex: new RegExp(category, 'i') };
    if (search) filter['info.name'] = { $regex: new RegExp(search, 'i') };

    console.log('Fetching distinct groupKeys with filter:', filter);
    const groupKeysResult = await Products.aggregate([
      { $match: filter },
      { $group: { _id: '$pid.groupKey' } },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit }
    ]);
    const groupKeys = groupKeysResult.map(result => result._id);
    console.log(`Found ${groupKeys.length} groupKeys:`, groupKeys);

    if (!groupKeys.length) {
      console.log('No groupKeys found');
      return res.json({
        products: [],
        total: 0,
        currentPage: page,
        totalPages: 0
      });
    }

    console.log('Fetching products...');
    const products = await Products.find({ 'pid.groupKey': { $in: groupKeys } });
    console.log(`Found ${products.length} products`);

    console.log('Grouping products...');
    const groupedProducts = groupKeys.map(groupKey => {
      return products.filter(p => p.pid && p.pid.groupKey === groupKey);
    });

    console.log('Counting total groupKeys...');
    const totalGroupsResult = await Products.aggregate([
      { $match: filter },
      { $group: { _id: '$pid.groupKey' } }
    ]);
    const totalGroups = totalGroupsResult.length;
    console.log(`Total groups: ${totalGroups}`);

    console.log('Sending response...');
    res.json({
      products: groupedProducts,
      total: totalGroups,
      currentPage: page,
      totalPages: Math.ceil(totalGroups / limit)
    });
  } catch (error) {
    console.error('Error in /api/products:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




    



app.listen(PORT || "3000", () => {
    console.log(`Server is running on port ${PORT}`);
});
