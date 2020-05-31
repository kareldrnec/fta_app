//event controller in FTA
var Event = require('../models/event');

exports.saveEvent = function(req, res, next){
    var valuesArray = [];
    if(((req.body.calculation_type).localeCompare("lambda")) == 0){
        valuesArray = [req.body.lambda_number];
    } else if(((req.body.calculation_type).localeCompare("lambda_mi")) == 0){
        valuesArray = [req.body.lambda_number, req.body.mi_number];
    } else if(((req.body.calculation_type).localeCompare("mtbf")) == 0){
        valuesArray = [req.body.mtbf_number];
    } else if(((req.body.calculation_type).localeCompare("mtbf_mttr")) == 0){
        valuesArray = [req.body.mtbf_number, req.body.mttr_number];
    } else if(((req.body.calculation_type).localeCompare("constant")) == 0){
        valuesArray = [req.body.p_number];
    }
    new Event({
        name: req.body.name,
        eventType: req.body.calculation_type,
        description: req.body.description,
        userID: req.session.userId,
        parentID: req.body.parent_id_gate_input,
        values: valuesArray
    }).save(function(err, mEvent){
        if(err){
            return next(err);
        } else {
            return res.redirect('/');
        }
    });
};

exports.getEvent = function(req, res, next) {
    let query = { "_id": req.params.id};
    Event.findOne(query, function(err, mEvent){
        res.render('editEvent', {
            tEvent: mEvent
        });
    });
};

exports.updateEvent = function(req, res, next) {
    var valuesArray = [];
    if(((req.body.calculation_type).localeCompare("lambda")) == 0){
        valuesArray = [req.body.lambda_number];
    } else if(((req.body.calculation_type).localeCompare("lambda_mi")) == 0){
        valuesArray = [req.body.lambda_number, req.body.mi_number];
    } else if(((req.body.calculation_type).localeCompare("mtbf")) == 0){
        valuesArray = [req.body.mtbf_number];
    } else if(((req.body.calculation_type).localeCompare("mtbf_mttr")) == 0){
        valuesArray = [req.body.mtbf_number, req.body.mttr_number];
    } else if(((req.body.calculation_type).localeCompare("constant")) == 0){
        valuesArray = [req.body.p_number];
    }
    query = { "_id": req.params.id};
    let update = {
        name: req.body.name,
        eventType: req.body.calculation_type,
        description: req.body.description,
        values: valuesArray
    }
    Event.update(query, update, function(err, mEvent) {
        if(err){
            return next(err);
        } else {
            res.redirect('/');
        }
    });

};

exports.deleteEvent = function(req, res, next) {
    query = { "_id": req.params.id};
    Event.findOneAndRemove(query, function(err, mEvent){
        res.redirect('/');
    });
};



exports.getEvents = function(req, res, next){
    Event.find({userID: req.session.userId}, function(err, mEvent){
    });
};