//view controller for async get and delete
var Gate = require('../models/gate');
var Event = require('../models/event');
var async = require('async');

exports.getObjects = function(req, res, next){
    var locals = [];
    async.parallel([
        function(callback) {
            Gate.find({userID: req.session.userId}, function(err, mGate){
                if (err) return callback(err);
                locals.gates = JSON.stringify(mGate);
                callback();
            });
        },

        function(callback) {
            Event.find({userID: req.session.userId}, function(err, mEvent){
                if (err) return callback(err);
                locals.events = JSON.stringify(mEvent);
                callback();
            });
        }
    ], function(err) {
        if (err) return next(err);
            res.render('index', {
                gatedata: locals.gates,
                eventdata: locals.events
            })
    });

}

exports.deleteObjects = function(req, res, next){
    query = { "userID": req.session.userId};
    async.parallel([
        function(callback) {
            Gate.deleteMany(query, function(err, mGate){
                if (err) return callback(err);
                callback();
            });
        },

        function(callback) {
            Event.deleteMany(query, function(err, mEvent){
                if (err) return callback(err);
                callback();
            });
        }
    ], function(err) {
        if (err) return next(err);
            res.redirect('/');
    });

}

