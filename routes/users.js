//user router
var express = require('express');
var router = express.Router();
var User = require('../models/user');
const { check, validationResult } = require('express-validator');

router.route('/login')
    .get((req, res, next) => {
        res.render('login', {title: 'Login'});
    })
    .post((req, res, next) => {
        if (req.body.name && req.body.password) {
            User.authenticate(req.body.name, req.body.password, function (error, user) {
                if (error || !user) {
                    let err = new Error('Wrong username or password.');
                    err.status = 401;
                    return res.redirect('/users/login?error=' + encodeURIComponent('Incorrect_Credential'));
                } else {
                    req.session.userId = user._id;
                    return res.redirect('/');
                }
            });
        }
        else {
            let err = new Error('All fields required.');
            err.status = 400;
            //next(err)
            return next(err);
        }
	});
    router.route('/register')
    .get((req, res, next) => {
        res.render('register', {title: 'Register'});
    })
    
    .post((req, res, next) => {
        if (req.body.username && req.body.email && req.body.password) {
            var userData = {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            }
            User.create(userData, function (err, mUser) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/users/login');
                }
            });
        }
        else {
            let err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        }

    });
router.get('/logout', function(req, res, next) {
	if (req.session) {
		req.session.destroy(function(err) {
			if(err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

module.exports = router;