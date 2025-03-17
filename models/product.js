const mongoose = require('mongoose');

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

module.exports = mongoose.model('Product', productSchema);
