const express = require('express')
const session = require('express-session')
const dotenv = require('dotenv').config()
let MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const app = express()
const hbs = require('hbs')
require('./helpers/helper');

// config file
const PUERTO = process.env.PORT || 3000;


let opciones = {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
}

let sessionStore = new MySQLStore(opciones)

app.use(session({
    key: 'cookie_22007',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 300000 } // 5 minutos (ms)
}))


// Para que tome los datos de los formularios
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(express.static('public'));

// HBS
app.set('view engine', 'hbs');
app.set('views', [
    path.join('./views/front'),
    path.join('./views/back'),
    path.join('./views'),
])
hbs.registerPartials(__dirname + '/views/partials');


// espacio para cargar el archivo de las rutas
app.use('/', require('./routes/rutas'))

// 404 - no encontrado
app.use(function(req, res) {
    res.status(404).render('404');
});


app.listen(PUERTO, function () {
    console.log(`El servidor está online en puerto ${PUERTO}`)
})