const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();

//MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ewasteDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({secret:'your secret key', resave: false, saveUninitialized: true}));

//set EJS as template engine
app.set('view engine', 'ejs');

//routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const adminRoutes = require('./routes/admin');

//use routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);


//Start the server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
}); 