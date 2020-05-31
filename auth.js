//authenticate input against database
module.exports = {
    requiresLogin: function (req, res, next) {
        if (req.session && req.session.userId) {
            return next();
        } else {
            return res.redirect('/users/login');
        }
    }
}