const mongoose = require('mongoose');
const fs = require('fs');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

// Подключение к MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Определение схемы для товара
const productSchema = new mongoose.Schema({
 links: {
    url: { type: String },
    path: { type: String }
  },
  
  pid: {
    groupKey: { type: String },
    internalPid: { type: String },
    merchProductId: { type: String },
    productCode: { type: String },
    globalProductId: { type: String }
  },
  
  data: {
    productType: { type: String },
    productSubType: { type: String }
  },
  
  info: {
    name: { type: String },
    subtitle: { type: String },
    discription: { type: String },
    color: {
      labelColor: { type: String },
      hex: { type: String },
      colorDescription: { type: String }
    }
  },
  
  imageData: { 
        portraitURL: { type: String },
        squarishURL: { type: String },
        imgMain: { type: String },
        images: { type: [String] },
  }, // Используем Mixed для гибкости структуры изображений
  
  price: {
    origin: {
      currency: { type: String },
      initialPrice: { type: Number },
      currentPrice: { type: Number },
      self: { 
         initial20: { type: Number },
         current20: { type: Number },
        }
    },
    self: {
      currency: { type: String, default: 'UAH' },
      UAH: { 
        initialPrice: { type: Number },
        currentPrice: { type: Number },
            },

      selfUAH: { 
        initial20: { type: Number },
        current20: { type: Number },
            }
        },
    },
  
  sizes: { type: String }, // Предполагаем, что это массив строк
  
  someAdditionalData: {
    isNewUntil: {
      type: Object,
      default: {} 
    },
    promotions: {
            promotionId: { type: Object, default: {} },

            visibilities: { type: [Object], default: [] },

    },
    // customization: {
    //   type: Schema.Types.Mixed,
    //   default: {}
    // },
        badgeAttribute: { type: Object, default: {} },

    badgeLabel: { type : Object, default: {} },
  }
}, {
  timestamps: true // Добавляет createdAt и updatedAt автоматически
});

// Создание модели на основе схемы
const Products = mongoose.model('Products', productSchema);

// Чтение JSON-файла
const jsonFilePath = './b0f7_nike_structData.json'; 
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Функция для сохранения данных в MongoDB
async function saveToMongo() {
    try {
        // Вставка данных в базу данных
        const result = await Products.insertMany(jsonData);
        console.log(`Успешно добавлено документов: ${result.length}`);
    } catch (error) {
        console.error('Ошибка при сохранении в MongoDB:', error.message);
    } finally {
        // Закрытие подключения
        mongoose.connection.close();
        console.log('Соединение с MongoDB закрыто.');
    }
}

// Запуск функции сохранения
saveToMongo();



