const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')
require('dotenv').config();

const cors = require('cors');
const {
    log
} = require('console');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
app.use(express.json());
app.use(express.static('public'));

// Middleware для CORS (разрешаем запросы с разных доменов)
app.use(cors());

// Главная страница
app.get('/', (req, res) => {
    console.log('GET / - Главная страница загружается');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tg', (req, res) => {
    console.log('GET / - Telegram страница загружается');
    res.sendFile(path.join(__dirname, 'public', 'indexTg.html'));
});

app.get('/home', (req, res) => {
    console.log('GET /home - Главная страница Telegram загружается');
    res.sendFile(path.join(__dirname, 'public', 'test5.html'));
});

app.get('/main', (req, res) => {
    console.log('GET /main - Главная страница загружается');
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/thenk-you', (req, res) => {
    console.log('GET /main - Главная страница загружается');
    res.sendFile(path.join(__dirname, 'public', 'thenk-you.html'));
});




// Подключение к MongoDB
mongoose.connect(MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Модель пользователя (обычные пользователи)
const UserSchema = new mongoose.Schema({
    username: {
        type: String, required: true, unique: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = UserSchema;
module.exports = User;



// Модель пользователя Telegram
const tgUserSchema = new mongoose.Schema({
    id: {
        type: String, required: true, unique: true
    },
    username: {
        type: String, required: false
    },
    First_name: {
        type: String, required: true
    },
    Last_name: {
        type: String, required: false
    },
}, {
    collection: 'tg users'
});

const tgUser = mongoose.model('tgUser', tgUserSchema);

module.exports = tgUserSchema;
module.exports = tgUser;

// Регистрация пользователя (обычная)
app.post('/register', async (req, res) => {
    try {
        console.log('POST /register -  Получен запрс на регистрацию!')
        const {
            username, email, password
        } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, and password are required'
            });
        }

        console.log(`POST /register - Данные пользователя: ${username}, ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username, email, password: hashedPassword
        });
        await user.save();


        console.log(`POST /register - Пользователь ${username} успешно зарегистрирован`);
        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Username or email already exists'
            });
        }
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// Регистрация через Telegram
app.post('/register/tg', async (req, res) => {
    try {
        console.log("/POST - Получен запрос на регестрацию пользователя через телеграм.")
        const {
            id,
            username,
            First_name,
            Last_name
        } = req.body;

        if (!id || !username || !First_name) {
            return res.status(400).json({
                message: 'Invalid userData'
            });
        }

        console.log(`POST /register/tg Данные пользователя: ${id}
            ${username}`);
        const tg_user = new tgUser({
            id, username, First_name, Last_name
        });
        await tg_user.save();

        console.log(`POST /register/tg - Пользователь ${username} успешно зарегистрирован`);
        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Username already exists'
            });
        }
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// Авторизация пользователя (обычная)
app.post('/login', async (req, res) => {
    try {
        console.log('POST /login - Получен запрос на авторизацию');
        const {
            login,
            password
        } = req.body;
        console.log(`POST /login - Попытка входа с логином: ${login}`);
        const user = await User.findOne({
            $or: [{
                username: login
            }, {
                email: login
            }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log('POST /login - Неверные учетные данные');
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign({
            userId: user._id, username: user.username
        }, JWT_SECRET);
        console.log(`POST /login - Пользователь ${user.username} успешно авторизован`);
        res.json({
            token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
});

// Авторизация через Telegram WebApp
app.post('/auth/telegram', async (req, res) => {
    try {
        console.log('POST /auth/telegram - Получен запрос на авторизацию');
        const {
            id,
            username,
            first_name,
            last_name,
        } = req.body;
        console.log(`POST /auth/telegram  - Попытка входа с логином: ${username}`);
        // Поиск пользователя в базе данных, например, по id или username
        let user = await tgUser.findOne({
            id
        });

        if (!user) {}

        // Генерация JWT токена
        const token = jwt.sign({
            userId: user._id, username: user.username
        }, JWT_SECRET);

        console.log(`POST /auth/telegram  - Пользователь ${user.username} успешно авторизован`);
        // Отправка токена в ответе
        res.json({
            token
        });
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({
            message: 'Ошибка сервера'
        });
    }
});

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
    console.log('Middleware - Проверка JWT');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Middleware - Токен отсутствует');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Middleware - Неверный токен');
            return res.sendStatus(403);
        }
        console.log(`Middleware - Токен проверен, пользователь: ${user.username}`);
        req.user = user;
        next();
    });
}

// Защищенный маршрут (пример)
app.get('/protected', authenticateToken, (req, res) => {
    console.log('GET /protected - Пользователь получил доступ к защищенному маршруту');
    res.json({
        message: 'Protected route accessed successfully',
        userId: req.user.userId,
        username: req.user.username
    });
});

// Определение схемы для товара
const productSchema = require('./model.js');
const Products = mongoose.model('Products', productSchema);






    // ##### Корзина #####

    // Схема элемента корзины (то же самое, что и раньше)
    const cartItemSchema = new mongoose.Schema({
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        default: 1
        },
    });

    // Схема корзины
    const cartSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // Связь с пользователем
        items: [cartItemSchema],
    });

    const Cart = mongoose.model('Cart', cartSchema);

    // API для получения корзины пользователя
    app.get('/api/cart', authenticateToken, async (req, res) => {
        try {
            const userId = req.user.userId; // Получаем ID пользователя из JWT токена
            let cart = await Cart.findOne({
                userId: userId
            }).populate('items.productId'); // Ищем корзину пользователя

            if (!cart) {
                // Если корзина не найдена, создаем новую
                cart = new Cart({
                    userId: userId, items: []
                });
                await cart.save();
            }

            res.json(cart);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Ошибка сервера при получении корзины', error: err.message
            });
        }
    });

    // API для добавления товара в корзину
    app.post('/api/cart/add/:productId', authenticateToken, async (req, res) => {
        const productId = req.params.productId;
        const userId = req.user.userId;
        const quantity = parseInt(req.body.quantity) || 1;

        try {
            console.log("Попытка добавить в корзину");
            let cart = await Cart.findOne({
                userId: userId
            });
            console.log('Existing cart match');
            if (!cart) {
                cart = new Cart({
                    userId: userId, items: []
                });
                console.log('New cart compleet');
            }

            const product = await Products.findById(productId);
            if (!product) {
                return res.status(404).json({
                    message: 'Товар не найден'
                });
            }

            // Проверяем, есть ли уже товар в корзине
            const existingItem = cart.items.find(item => item.productId.equals(productId));

            if (existingItem) {
                existingItem.quantity += quantity; // Если товар уже есть, увеличиваем количество
            } else {
                cart.items.push({
                    productId: productId, quantity: quantity
                }); // Иначе добавляем новый элемент
            }

            await cart.save();
            await cart.populate('items.productId'); // Заполняем информацию о продукте
            res.status(201).json(cart);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Ошибка сервера при добавлении в корзину', error: err.message
            });
        }
    });

    // API для удаления товара из корзины
    app.delete('/api/cart/remove/:productId', authenticateToken, async (req, res) => {
        const productId = req.params.productId;
        const userId = req.user.userId;

        try {
            let cart = await Cart.findOne({
                userId: userId
            });

            if (!cart) {
                return res.status(404).json({
                    message: 'Корзина не найдена'
                });
            }

            // Фильтруем элементы корзины, удаляя указанный товар
            cart.items = cart.items.filter(item => !item.productId.equals(productId));
            await cart.save();
            await cart.populate('items.productId'); // Заполняем информацию о продукте
            res.json(cart);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Ошибка сервера при удалении из корзины', error: err.message
            });
        }
    });

    // API для обновления количества товара в корзине
    app.put('/api/cart/update/:productId', authenticateToken, async (req, res) => {
        const productId = req.params.productId;
        const userId = req.user.userId;
        const quantity = parseInt(req.body.quantity);

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: 'Неверное количество'
            });
        }

        try {
            let cart = await Cart.findOne({
                userId: userId
            });

            if (!cart) {
                return res.status(404).json({
                    message: 'Корзина не найдена'
                });
            }

            // Находим элемент корзины для обновления
            const existingItem = cart.items.find(item => item.productId.equals(productId));

            if (!existingItem) {
                return res.status(404).json({
                    message: 'Товар не найден в корзине'
                });
            }

            existingItem.quantity = quantity; // Обновляем количество
            await cart.save();
            await cart.populate('items.productId'); // Заполняем информацию о продукте
            res.json(cart);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Ошибка сервера при обновлении корзины', error: err.message
            });
        }
    });

    // ##### Конец корзины #####

    // // API для получения всех товаров
    // app.get('/api/products', async (req, res) => {
    //     try {
    //         console.log('запрос списка продуктов');
    //         const products = await Products.find();
    //         res.json(products);
    //     } catch (err) {
    //         res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    //     }
    // });
   app.get('/api/products', async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const color = req.query.color; // Фильтр по цвету
        const category = req.query.category; // Фильтр по категории
        const search = req.query.search; // Поиск по названию

        console.log(`GET /api/products - Page: ${page}, Limit: ${limit}, Skip: ${skip}, Color: ${color}, Category: ${category}, Search: ${search}`);

        try {
            console.log('Checking MongoDB connection...');
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB not connected');
            }
            console.log('MongoDB connection is active');

            // Формируем объект фильтра
            const filter = {
                'pid.groupKey': {
                    $exists: true
                }
            };
            if (color) {
                filter['info.color.labelColor'] = color;
            }
            if (category) {
                filter['data.productType'] = category; // Предполагаем, что категория хранится в data.productType
            }
            if (search) {
                filter['info.name'] = {
                    $regex: search,
                    $options: 'i'
                }; // Регистронезависимый поиск
            }

            console.log('Filter applied:', filter);

            // Шаг 1: Получаем уникальные groupKey с учетом фильтров и пагинации
            console.log('Fetching distinct groupKeys with aggregation...');
            const groupKeysResult = await Products.aggregate([{
                $match: filter
            }, // Применяем фильтры
                {
                    $group: {
                        _id: '$pid.groupKey'
                    }
                }, // Группируем по groupKey
                {
                    $sort: {
                        _id: 1
                    }
                }, // Сортировка для стабильности
                {
                    $skip: skip
                }, // Пропускаем элементы
                {
                    $limit: limit
                } // Ограничиваем количество
            ]);
            const groupKeys = groupKeysResult.map(result => result._id);
            console.log(`Found ${groupKeys.length} groupKeys:`, groupKeys);

            if (!groupKeys.length) {
                console.log('No groupKeys found, returning empty response');
                return res.json({
                    products: [],
                    total: 0,
                    currentPage: page,
                    totalPages: 0
                });
            }

            // Шаг 2: Получаем продукты для этих groupKey
            console.log('Fetching products for groupKeys...');
            const products = await Products.find({
                'pid.groupKey': {
                    $in: groupKeys
                }
            })
            .select('info.name info.subtitle info.color price.self.UAH.currentPrice price.self.UAH.initialPrice imageData.imgMain imageData.images links.url sizes pid.groupKey');
            console.log(`Found ${products.length} products`);

            // Шаг 3: Группируем продукты по groupKey
            console.log('Grouping products...');
            const groupedProducts = groupKeys.map(groupKey => {
                return products.filter(p => p.pid && p.pid.groupKey === groupKey);
            });
            console.log('Products grouped successfully');

            // Шаг 4: Подсчитываем общее количество уникальных groupKey с учетом фильтров
            console.log('Counting total distinct groupKeys...');
            const totalGroupsResult = await Products.aggregate([{
                $match: filter
            }, // Применяем те же фильтры
                {
                    $group: {
                        _id: '$pid.groupKey'
                    }
                }]);
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
            res.status(500).send(`Server error: ${error.message}`);
        }
    });
    // API для получения товара по ID
    app.get('/api/products/:id', async (req, res) => {
        try {
            const product = await Products.find({
                "data.productType": req.params.id
            });
            if (!product) {
                return res.status(404).json({
                    message: 'Товар не найден'
                });
            }
            res.json(product);
        } catch (err) {
            res.status(500).json({
                message: 'Ошибка сервера', error: err.message
            });
        }
    });

    // API для добавления нового товара
    app.post('/api/products', async (req, res) => {
        try {
            const product = new Products(req.body);
            await product.save();
            res.status(201).json(product);
        } catch (err) {
            res.status(400).json({
                message: 'Ошибка при добавлении товара', error: err.message
            });
        }
    });

    // API для обновления товара
    app.put('/api/products/:id', async (req, res) => {
        try {
            const updatedProduct = await Products.findByIdAndUpdate(req.params.id, req.body, {
                new: true
            });
            if (!updatedProduct) {
                return res.status(404).json({
                    message: 'Товар не найден'
                });
            }
            res.json(updatedProduct);
        } catch (err) {
            res.status(400).json({
                message: 'Ошибка при обновлении товара', error: err.message
            });
        }
    });

    // API для удаления товара
    app.delete('/api/products/:id', async (req, res) => {
        try {
            const deletedProduct = await Products.findByIdAndDelete(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({
                    message: 'Товар не найден'
                });
            }
            res.json({
                message: 'Товар удален'
            });
        } catch (err) {
            res.status(500).json({
                message: 'Ошибка сервера', error: err.message
            });
        }
    });

    // Указываем папку для хранения загруженных файлов
    const storage = multer.diskStorage({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
        }
    });

    const upload = multer({
        storage
    });

    // Разрешаем отдавать статические файлы из папки "uploads"
    app.use('/uploads', express.static('uploads'));

    // Маршрут для загрузки файла
    app.post('/upload', upload.single('image'), (req, res) => {
        console.log("Попытка загрузки файлов");
        if (!req.file) {
            return res.status(400).json({
                error: 'Файл не был загружен'
            });
        }
        res.json({
            url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        });
        console.log(`Фото успешго загруженно:
            http://ad.ddns.net/uploads/${req.file.filename}`);
    });


    /* server.js */

    // ... (Предыдущие схемы и модели)

    // Схема для заказа
    const orderSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
        totalAmount: {
            type: Number,
            required: true
        },
        orderDate: {
            type: Date,
        default: Date.now
        },
        orderStatus: {
            type: String,
        default: 'В обработке'
        },
        oStatusCode: {
            type: String,
        default: '1'
        }
    });

    module.exports = orderSchema;

    // Модель для заказа
    const Order = mongoose.model('Order', orderSchema);

    module.exports = Order;


    /* server.js */

    // ... (Предыдущий код)

    app.post('/api/checkout', authenticateToken, async (req, res) => {
        try {
            const userId = req.user.userId;
            const {
                name,
                phone,
                email,
                address,
                paymentMethod
            } = req.body;

            // 1. Получаем корзину пользователя из базы данных
            const userCart = await Cart.findOne({
                userId
            }).populate('items.productId');

            if (!userCart || userCart.items.length === 0) {
                return res.status(400).json({
                    message: 'Корзина пуста'
                });
            }

            // 2. Рассчитываем общую стоимость заказа (для надежности, пересчитываем на сервере)
            let totalAmount = 0;
            for (const item of userCart.items) {
                totalAmount += parseFloat(item.productId.UAH) * item.quantity;
            }

            // 3. Создаем заказ в базе данных
            const order = new Order({
                userId,
                name,
                phone,
                email,
                address,
                paymentMethod,
                items: userCart.items.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity
                })),
                totalAmount,
                orderStatus: 'В обработке',
                oStatusCode: '1'
            });

            await order.save(); // Сохраняем заказ в базе данных

            // 4. Очищаем корзину пользователя после оформления заказа
            userCart.items = []; // Очищаем товары в корзине
            await userCart.save(); // Сохраняем пустую корзину

            // 5. Возвращаем успешный ответ
            res.json({
                message: 'Заказ успешно оформлен!', orderId: order._id
            });

        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            res.status(500).json({
                message: 'Ошибка сервера при оформлении заказа', error: error.message
            });
        }
    });


    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
