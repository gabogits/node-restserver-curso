const express = require('express');
const app = express();
const mongoose = require('mongoose');


const bodyParser = require('body-parser');
require('./config/config');



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//app.use  son middlewares son funciones que se va disparar cada vez que el pase por aqui el codigo, cada vez que hagamos una peticiones

// parse application/json
app.use(bodyParser.json())


//configuracion global de rutas
app.use(require('./routes/index')); //asi importamos y usamos esas rutas del usuario



mongoose.connect(process.env.urlDB, (err, res) => {
    if (err) throw err;
    console.log("Base de datos ONLINE");
});


app.listen(process.env.PORT, () => {
    console.log('Escuchando peticiones en el puerto: ', process.env.PORT)
});