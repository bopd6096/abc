    // app.get('/api/products', async (req, res) => {
    //   const page = parseInt(req.query.page) || 1;
    //   const limit = parseInt(req.query.limit) || 100;
    //   const skip = (page - 1) * limit;
    //
    //   try {
    //     const products = await Products.find()
    //       .skip(skip)
    //       .limit(limit);
    //     const total = await Products.countDocuments();
    //     res.json({
    //       products,
    //       total,
    //       currentPage: page,
    //       totalPages: Math.ceil(total / limit)
    //     });
    //   } catch (error) {
    //     res.status(500).send(error.message);
    //   }
    // });
    // app.get('/api/products', async (req, res) => {
    //   const page = parseInt(req.query.page) || 1;
    //   const limit = parseInt(req.query.limit) || 10;
    //   const skip = (page - 1) * limit;
    //
    //   console.log(`GET /api/products - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    //
    //   try {
    //     console.log('Checking MongoDB connection...');
    //     if (mongoose.connection.readyState !== 1) {
    //       throw new Error('MongoDB not connected');
    //     }
    //     console.log('MongoDB connection is active');
    //
    //     // Шаг 1: Получаем уникальные groupKey с пагинацией через агрегацию
    //     console.log('Fetching distinct groupKeys with aggregation...');
    //     const groupKeysResult = await Products.aggregate([
    //       { $match: { 'pid.groupKey': { $exists: true } } }, // Убедимся, что поле существует
    //       { $group: { _id: '$pid.groupKey' } }, // Группируем по groupKey
    //       { $sort: { _id: 1 } }, // Сортировка для стабильной пагинации
    //       { $skip: skip }, // Пропускаем элементы
    //       { $limit: limit } // Ограничиваем количество
    //     ]);
    //     const groupKeys = groupKeysResult.map(result => result._id);
    //     console.log(`Found ${groupKeys.length} groupKeys:`, groupKeys);
    //
    //     if (!groupKeys.length) {
    //       console.log('No groupKeys found, returning empty response');
    //       return res.json({
    //         products: [],
    //         total: 0,
    //         currentPage: page,
    //         totalPages: 0
    //       });
    //     }
    //
    //     // Шаг 2: Получаем продукты для этих groupKey
    //     console.log('Fetching products for groupKeys...');
    //     const products = await Products.find({ 'pid.groupKey': { $in: groupKeys } })
    //       .select('info.name info.subtitle info.color price.self.UAH.currentPrice price.self.UAH.initialPrice imageData.imgMain imageData.images links.url sizes pid.groupKey');
    //     console.log(`Found ${products.length} products`);
    //
    //     // Шаг 3: Группируем продукты по groupKey
    //     console.log('Grouping products...');
    //     const groupedProducts = groupKeys.map(groupKey => {
    //       return products.filter(p => p.pid && p.pid.groupKey === groupKey);
    //     });
    //     console.log('Products grouped successfully');
    //
    //     // Шаг 4: Подсчитываем общее количество уникальных groupKey
    //     console.log('Counting total distinct groupKeys...');
    //     const totalGroups = await Products.distinct('pid.groupKey', { 'pid.groupKey': { $exists: true } }).then(keys => keys.length);
    //     console.log(`Total groups: ${totalGroups}`);
    //
    //     console.log('Sending response...');
    //     res.json({
    //       products: groupedProducts,
    //       total: totalGroups,
    //       currentPage: page,
    //       totalPages: Math.ceil(totalGroups / limit)
    //     });
    //   } catch (error) {
    //     console.error('Error in /api/products:', error.stack);
    //     res.status(500).send(`Server error: ${error.message}`);
    //   }
    // });
 
