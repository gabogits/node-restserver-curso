const express = require('express');
const fs = require("fs");
const app = express();
const path = require("path");

const { verificaTokenImg } = require('../middlewares/autenticacion');


app.get('/imagen/:tipo/:img', verificaTokenImg, function(req, res) {
    let tipo = req.params.tipo;
    let img = req.params.img;


    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    console.log(pathImagen)
        //asi cargamos una imagen a la vista
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen)
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath) //lee el content type del archiivo y eso es lo que va regresar, si es una imagen, va regresar una imagen, si es un json regresa un json, html

    }



});


// assets va ser un lugar donde almacenamos archivos estaticos o info global, como estilos imagenes etc

module.exports = app;