const express = require('express');
let app = express();
let Categoria = require('../models/categoria');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

//===================================
// Mostrar todas las categorías
//===================================

app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion') //ordena los documentos de modo ascendente (alfabeticamente), de acuerdo al campo o propiedad del objeto especificado
        .populate('usuario', 'nombre email') //busca que id's u objectId existen en la categoria que esta solicitando y  carga esa infomracion, en este caso es la informaciuon del usuario,
        // el segundo argumento, indica que propiedades del objeto queremos traer en este caso el nombre y el iud
        .exec((err, categorias) => { //cargar las categorias de esta manera con exec, nos permite hacer procedimientos adicionales previos, como populate y sort
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
        })

});
//===================================
// Mostrar una categoria por ID
//===================================

app.get('/categoria/:id', verificaToken, (req, res) => {
    //  Categoria.findById(....);
    let id = req.params.id;



    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })



});


//===================================
// Crear nueva categoría
//===================================

app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id //este valor no podria obtenerse sin el objeto que trae el verificaToken
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ //error de base de datos
                ok: false,
                err
            });
        }
        if (!categoriaDB) { // si no se crea la categoria
            return res.status(400).json({
                ok: false,
                err // aqui nos dice por que no se creó la categoria
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});



//===================================
// Actualizar una categoría
//===================================

app.put('/categoria/:id', verificaToken, (req, res) => {


    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })


});

//===================================
// Borrar una categoría
//===================================

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // solo un administrador puede borrar categorías //eliminar fisicamente de la database
    // Categoria.findByIdAndRemove

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        };
        res.json({
            ok: true,
            message: 'Categoría borrada',
            categoria: categoriaDB
        });


    })
});


module.exports = app;