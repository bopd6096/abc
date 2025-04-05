

require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// OAuth2-клиент
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Функция для отправки письма
async function sendMail() {
    try {
        // Получаем новый access_token
        const accessToken = await oAuth2Client.getAccessToken();
        if (!accessToken) {
            throw new Error("Невозможно получить access token");
        }

        // Настраиваем транспорт с OAuth2
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "dealzone.sm@gmail.com",
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        // Параметры письма
        const mailOptions = {
            from: "dealzone.sm@gmail.com",
            to: "vtj.vlad@gmail.com",
            subject: "Тест OAuth2",
            text: "Привет, это тестовое письмо с OAuth2!",
        };

        // Отправляем письмо
        const result = await transporter.sendMail(mailOptions);
        console.log("Email отправлен:", result.response);
    } catch (error) {
        console.error("Ошибка отправки:", error);
    }
}

// Вызываем функцию
sendMail();






// const nodemailer = require("nodemailer");
//
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "anotherplaywr2@gmail.com",
//         pass: "Guest42737"
//     }
// });
//
// function sendEmailNotification() {
//     const mailOptions = {
//         from: "anotherplaywr2@gmail.com",
//         to: "vtj.vlad@gmail.com",
//         subject: "test",
//         text: `ny tipatest `
//     };
//
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error("Ошибка при отправке email:", error);
//         } else {
//             console.log("Email отправлен:", info.response);
//         }
//     });
// }
// sendEmailNotification();
