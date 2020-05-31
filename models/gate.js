//schema of gate in FTA
var mongoose = require('mongoose');

var Gate = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    gateType: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        unique: false
    },
    description: {
        type: String
    },
    userID:{
        type: String,
        required: true
    },
    parentID:{
        type: String,
        required: true
    }
});
module.exports = mongoose.model('gate', Gate);