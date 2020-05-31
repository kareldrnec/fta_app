//events router
const express = require('express');
const router = express.Router();
const auth = require('../auth');
const event_controller = require('../controllers/eventController');

router.get('/', auth.requiresLogin, function(req, res, next) {
    res.redirect('/');
});

router.get('/addEvent', auth.requiresLogin, (req, res) => {
	res.render('addEvent', { 
		title: 'Add Event'});
});

router.post('/addEvent', auth.requiresLogin, event_controller.saveEvent);

router.get('/editEvent/:id', auth.requiresLogin, event_controller.getEvent);

router.post('/editEvent/:id', auth.requiresLogin, event_controller.updateEvent);

router.get('/delete/:id', auth.requiresLogin, event_controller.deleteEvent);


module.exports = router;