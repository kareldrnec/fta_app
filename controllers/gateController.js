//gate controller in FTA
var Gate = require('../models/gate');

exports.saveGate = function(req, res, next){
    var numberVar = null;
    if(((req.body.gate_type).localeCompare("K/N")) == 0){
        numberVar = req.body.number;
    }
    new Gate({
        name: req.body.name,
        gateType: req.body.gate_type,
        description: req.body.description,
        number: numberVar,
        parentID: req.body.parent_id_gate_input,
        userID: req.session.userId
    }).save(function(err, mGate){
        if(err){
            return next(err);
        } else {
            res.redirect('/');
        }
    });
};

exports.getGate = function(req, res, next) {
    let query = { "_id": req.params.id};
    Gate.findOne(query, function(err, mGate){
        res.render('editGate', {
            tGate: mGate
        });
    });
};

exports.updateGate = function(req, res, next) {
    var numberVal = null;
    var name = req.body.name;
    if(((req.body.gate_type).localeCompare("K/N")) == 0){
        numberVal = req.body.number;
    }
    if(name.localeCompare("") == 0){
        name = null;
    }
    let query = { "_id": req.params.id};
    let update = {
        name: name,
        gateType: req.body.gate_type,
        description: req.body.description,
        number: numberVal
    }
    Gate.update(query, update, function(err, mGate) {
        if(err){
            return next(err);
        } else {
            res.redirect('/');
        }
    });
};

exports.deleteGate = function(req, res, next) {
    query = { "_id": req.params.id};
    Gate.findOneAndRemove(query, function(err, mGate){
        res.redirect('/');
    });
};


exports.getGates = function(req, res, next){
    Gate.find({userID: req.session.userId}, function(err, mGate){});
};






