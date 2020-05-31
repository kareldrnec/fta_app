//middleware of app
require('dotenv').config()
const express = require('express');
const app = express();
const createError = require('http-errors');
const expbs = require('express-handlebars');
const path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose'); 
var logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const port = process.env.PORT || 3000;

app.engine('handlebars', expbs({
	defaultLayout: 'main',
	layoutsDir: path.join(__dirname, 'views/layouts')
}));
let mongoDBUrl = process.env.MONGODB_URI || 'mongodb+srv://user1234:user1234@cluster0-gr9ky.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(mongoDBUrl);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
var expiryDate = new Date(Date.now() + 60 * 60 * 1000)
app.use(session({
    secret: 'super secure',
    httpOnly: true,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    }),
    expires: expiryDate
}));
db.once('open', () => console.log('connected to database'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/gates', require('./routes/gates'));
app.use('/events', require('./routes/events'));
app.use(function(req,res){
    res.status(404).render('error.handlebars');
});
//app listening

module.exports = app;
app.listen(port);