const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    sellerId: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    supply: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
}, {
    collection: "sales"
});

module.exports = mongoose.model('Sale', salesSchema);