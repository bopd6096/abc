
const mongoose = require("mongoose");
const sendNotification = require("./sendTg");
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI);

const orderSchema =  mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    orderStatus: { type: String, default: 'Новый' },
    oStatusCode: { type: Number, default: 1 }
});


// Модель для продуктов

const Order = mongoose.model('Order', orderSchema);

    const userSchema =  mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        username: { type: String, required: true },
    });
    const User = mongoose.model('User', userSchema);

    const tgUserSchema =  mongoose.Schema({ 
        _id: mongoose.Schema.Types.ObjectId,
        id: { type: Number, required: true },
        username: { type: String, required: true },
    }, { collection: 'tg users' });
    const tgUser = mongoose.model('tgUser', tgUserSchema);
    const productSchema =  mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true },
        UAH: { type: Number, required: true },
    });
    const Product = mongoose.model('Product', productSchema);


    


// Модель для заказаv



async function watchChanges() {
    console.log("Начинаем отслеживание изменений в MongoDB...");


    const changeStream = Order.watch();

    changeStream.on("change", (change) => {
        console.log("Изменение в БД:", change);

        const documentKey = change.documentKey;
        const fullDocument = change.fullDocument;
        const { _id, userId, name, phone, email, address, paymentMethod, items, totalAmount, orderDate, orderStatus, oStatusCode } = fullDocument;
        const { productId } = items[0]; 
        for (let i = 0; i < items.length; i++) {
            console.log(`${items[i].productId}`);
        }   console.log(`${userId}`);
        
        const userIdString = userId.toString(); 
             const productIdString = items.map(item => item.productId.toString());

                




         
        tgUser.findOne({_id: userIdString}).then((user) => {
            if (user) {
                console.log(user);
                const { id, username } = user;
                sendNotification(`Username: ${username} telegram id: ${id}`);
            } return;
        });

        User.findOne({_id: userIdString}).then((user) => {
            if (user) {
                console.log(user);
                const { username } = user;
                sendNotification(`Username: ${username}`);
            } return;
        });

        productIdString.forEach((id) => {
            Product.findOne({_id: id}).then((product) => {
                console.log(product);
                const { name, UAH } = product;
                sendNotification(`Товар: ${name}, Price: ${UAH} грн.`);
            });

             
        });




        sendNotification(
            `🔔 Новый заказ!\n\n` +
            `📌 ID заказа: ${_id}\n` +
            `👤 Покупатель: ${name}\n` +
            `📞 Телефон: ${phone}\n` +
            `✉️ Email: ${email}\n` +
            `📍 Адрес: ${address}\n` +
            `💳 Оплата: ${totalAmount}\n\n` +
            `🛒 Товары:\n` +
            items.map(item => `- ${item.productId}:  (x${item.quantity})`).join("\n")   
);
        // sendNotification(`🔔 Обновление в БД:\n\n${JSON.stringify(orderId, null, 2)}`);
    });
}

watchChanges();


// User.findOne({_id: userIdString}).then((user) => {
//             console.log(user);
//             const { username } = user;
//                 sendNotification(`Username: ${username}`);
//
