//schema of event in FTA app
var mongoose = require('mongoose');

var Event = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    values: { 
        type: Array, 
        "default" : [] 
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

module.exports = mongoose.model('event', Event);