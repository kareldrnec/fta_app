//index router
const express = require('express');
const router = express.Router();
const auth = require('../auth');
const view_controller = require('../controllers/viewController');


router.get('/', auth.requiresLogin, view_controller.getObjects);

router.get('/about', auth.requiresLogin, (req, res) => {
	res.render('about', { 
		title: 'About'});
});

router.get('/help', auth.requiresLogin, (req, res) => {
	res.render('help', { 
		title: 'Help'});
});

router.get('/startAnalysis', auth.requiresLogin, (req, res) => {
	res.render('startAnalysis', { 
		title: 'Start an Analysis'});
});

router.post('/startAnalysis', auth.requiresLogin, (req, res) => {
	res.redirect('/results');
});

router.get('/results', auth.requiresLogin, (req, res) => {
	res.render('results', { 
		title: 'Results'});
});

router.get('/deleteAllObjects', auth.requiresLogin, view_controller.deleteObjects);


module.exports = router;