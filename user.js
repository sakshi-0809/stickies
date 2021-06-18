const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    notes: [
        {
            key: String,
            color: String,
            content: String,
            meta: String,
            starred: Boolean
        }
    ]
});

module.exports = mongoose.model('User', user);
