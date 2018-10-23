const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require("fs"); //para revisar si una imagen existe o no en nuestra carpeta de archivos, usamos el filesystem
const path = require("path");
// default options
app.use(fileUpload()); //carga el todo un objeto en req.files








app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: "No se ha seleccionado ningun archivo"
                }
            })
    }

    // Valida tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '), //junta el contenido del arreglo extensionesValidas separandolas por comas 

            }
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file

    // si viene un archivo va caer dentro de req.files
    let archivo = req.files.archivo; //archivo es el nombre que lleva el input que carga el archivo (archivo input tipo file  
    let nombreCortado = archivo.name.split('.'); //con name toma el nombre del archivo y split lo separa de la extensión

    let extension = nombreCortado[nombreCortado.length - 1]; //toma el ultimo fragmento del nombre del archivo, que vendria siendo la extensión
    console.log(extension);


    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extensiones permitidas son ' + extensionesValidas.join(', '), //junta el contenido del arreglo extensionesValidas separandolas por comas 
                ext: extension //imprime las extensiones recibidas
            }
        });
    }

    //Cambiar nombre al archivo

    let nombreArchivo = `${ id }-${new Date().getMilliseconds() }.${ extension }`;
    // ademas del id por default que le agrega al elemento, se agrega el valor en milisegundo de la fecha en que se subio esa imagen y seguido de la extension



    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => { //archivo.mv( mv, significa mover, posteriormente hay se especifica una ruta y un nombre del archivo
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Aqui, imagen cargada

        if (tipo == "usuarios") {
            imagenUsuario(id, res, nombreArchivo); // nombreArchivo se pasa sin la ruta  por que esta puede cambiar
        }
        if (tipo == "productos") {
            imagenProducto(id, res, nombreArchivo); // nombreArchivo se pasa sin la ruta  por que esta puede cambiar
        }


        // aunque 


    });

});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            // cuando haya un error de primera instancia
            // hay que borrar la imagen que ya se subio -ya que estos procedimientos, son posterione a la carga de la imagen
            // antes de  este punto ya se cargo la imagen, pero en estos procedimientos, se decide, borrarla
            //en este caso se decide borrarla por que hubo un error de estatus 500,
            //en este caso se pasa directo el nombre del archivo cargado para borrarla (especificado en el parametro nombreArchivo) no usuarioDB.img
            //ya que posiblemente no entró al modelo por el error y no se sabria que imagen no borrar
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {

            borrarArchivo(nombreArchivo, 'usuarios');
            //de igual manera se  pasa directo el nombre del archivo cargado para borrarlo ya que en este caso el usuario no existe y por ende el modelo
            //por lo que no hay modelo donde buscar el nombre de esa imagen a borarr
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no existe"
                }
            });
        }
        borrarArchivo(usuarioDB.img, 'usuarios');
        //la funcionalidad de borrarArchivo, es encontrar una concidencia en la carpeta de uploads con la imagen que se quiere actualizar
        //si existe una imagen con el mismo nombre en la carpeta de uploads, se borra antes de guardar la actualizada
        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {

            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Producto no existe"
                }
            });
        }
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                usuario: productoGuardado,
                img: nombreArchivo
            })
        })
    });
}

function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`); //cada segmento del resolve son parametros del path
    //va ir a esta carpeta a buscar esa imagen para saber si existe para remplazarla o en caso de que no exista la carga por primera vez

    if (fs.existsSync(pathImagen)) { //con fs checamos si existe la imagen con la ruta y nombre especificado
        fs.unlinkSync(pathImagen); //con esta funcion borra las imagenes de las carpetas
    }
}
module.exports = app;