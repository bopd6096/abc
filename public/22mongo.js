const mongoose = require('mongoose');
const fs = require('fs');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Подключение к MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


const productSchema = new mongoose.Schema({
    id: { type: String, required: true },
    subtitle: { type: String, required: true },
    pbbCode: { type: String, required: true },
    frontendUuid: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    productBrand: { type: Object, required: true },
    categories: { type: Array, required: true },
    color: { type: Object, required: true },
    price: { type: Number, required: true },
    priceRegular: { type: Number, required: true },
    priceMinimak: { type: Number, required: true },

});



const Products = mongoose.model('Products', productSchema);

// Чтение JSON-файла
const jsonFilePath = '.json';
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


