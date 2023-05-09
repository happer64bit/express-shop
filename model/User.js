const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: {
        unique: true,
        type: String,
        required: true,
    },
    username: {
        unique: true,
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        required: true,
    },
    balance: {
        type: Number
    }
}, {
    collection: "users"
})

module.exports = mongoose.model("User", userSchema);
