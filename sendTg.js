const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config(); // Загружаем .env

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

/**
 * Отправка уведомления в Telegram
 * @param {string} message - Текст уведомления
 */
async function sendNotification(message) {
    const chatId = process.env.CHAT_ID; // Твой chat_id из Telegram
    try {
        await bot.sendMessage(chatId, message);
        console.log("Уведомление отправлено:", message);
    } catch (error) {
        console.error("Ошибка при отправке уведомления:", error);
    }
}


// sendNotification("Привет, мир!");


module.exports = sendNotification;
