const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        required: true,
    },
    totalSale: {
        type: Number
    },
    balance: {
        type: Number
    }
}, {
    collection: "profiles"
});

module.exports = mongoose.model('Profile', profileSchema);