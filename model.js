const mongoose = require('mongoose');
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
    },
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
        sizes: { type: String },
        someAdditionalData: { isNewUntil: { type: Object, default: {} },
            promotions: {
                promotionId: { type: Object, default: {} },
                visibilities: { type: [Object], default: [] },
            },
            // customization: {
            //   type: Schema.Types.Mixed,
            //   default: {}
            // },
            badgeAttribute: { type: Object, default: {} },

            badgeLabel: { type: Object, default: {} },
        }
    },
    { timestamps: true });
    // Создание модели товара
    // const Products = mongoose.model('Products', productSchema);


    module.exports = productSchema;
    // module.exports = Products;

