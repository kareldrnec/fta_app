//gates router
const express = require('express');
const router = express.Router();
const auth = require('../auth');
const gate_controller = require('../controllers/gateController');

router.get('/', auth.requiresLogin, function(req, res, next) {
    res.redirect('/');
});
router.get('/editGate', auth.requiresLogin, function(req, res, next) {
	res.redirect('/');
});


router.get('/addGate', auth.requiresLogin, (req, res) => {
	res.render('addGate', { 
		title: 'Add a Gate'});
});

router.post('/addGate', auth.requiresLogin, gate_controller.saveGate);

router.get('/editGate/:id', auth.requiresLogin, gate_controller.getGate);

router.post('/editGate/:id', auth.requiresLogin, gate_controller.updateGate);

router.get('/delete/:id', auth.requiresLogin, gate_controller.deleteGate);


module.exports = router;