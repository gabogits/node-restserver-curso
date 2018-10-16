const express = require('express');
let app = express();

let Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/autenticacion');


//===================================
// Obtener todos los productos
//===================================


app.get('/productos', verificaToken, (req, res) => {
    //trae todos los productos
    // populate: usuario categoría
    //paginado



    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);


    Producto.find({ disponible: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => { //ejecuta el find
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos,


            })


        })





})



//===================================
// Obtener un producto por ID
//===================================

app.get('/productos/:id', verificaToken, (req, res) => {

    // populate: usuario categoría

    let id = req.params.id;



    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            };
            res.json({
                ok: true,
                producto: productoDB
            });
        })



});


//===================================
// Buscar productos
//===================================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {


    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    //RegExp es una funcion de javascript, que permite crear considencias con la cadena especificada como parametro,
    // de una manera flexible, coicidencia parcial, no necesariamente literal
    // en lugar de ensalada cesar podemos poner como parametro de termino ensalada c y con ello devolveria todos los resultados que
    //coincidan con esos caracteres, como ensalada cesar
    // 'i' es para que sea insensible, a la mayusculas y minuscula 

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productos
            });
        });

});

//===================================
// Crear un nuevo producto
//===================================

app.post('/productos', verificaToken, (req, res) => {

    // grabar el usuario
    // grabar una categoria de listado

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,

    });
    /*si la categoria existe graba si no muestra un error
    if (producto.categoria  ) {

    }
    */


    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});







//===================================
// Actualizar un producto
//===================================

app.put('/productos/:id', verificaToken, (req, res) => {


    let id = req.params.id;
    let body = req.body;


    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;






        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        })

    })


    /*esta es otra forma de actualizar


    let productoActualizado = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible,
        descripcion: body.descripcion
    }

    Producto.findByIdAndUpdate(id, productoActualizado, { new: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    })
  */

});






//===================================
// Borrar un producto
//===================================

app.delete('/productos/:id', verificaToken, (req, res) => {

    //desahabilitar un producto no borrarlo, decir algo asi como el producto se ha sacado de circulación, disponible es igual a false

    let id = req.params.id;
    /*
    otra forma de hacerlo
        let cambiaEstado = { //aqui cambia por defaul el valor de el disponible, sin especificarselo en el body o en el formulario
            disponible: false
        }

        Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {


            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            };
            res.json({
                ok: true,
                producto: productoBorrado
            });
        })
    */
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        };

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        })
    });




});




module.exports = app;