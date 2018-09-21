const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => { //findOne es un metodo de mongoose para encontrar un usuario, lo buscamos por el email
        if (err) {
            return res.status(500).json({ //500 error interno del servidor
                ok: false,
                err
            });
        }
        if (!usuarioDB) { //si el usuario (correo) no fue encontrado en la base de datos no se encuentra se imprime este  error 
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrecto'
                }
            });
        };
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrecto'
                }
            });
        }

        let token = jwt.sign({
                usuario: usuarioDB //en el token decidimos guardamos la informacion del usuario
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //aqui se le manda el secret y el expireIn (osea el tiempo que tarda en expirar el token, en este caso se configuro que expira en 30 dias)

        res.json({
                ok: true,
                usuario: usuarioDB,
                token
            }) //copiando y pegando el  valor que se le asignó al token en el encoded de jwt podemos ver la info del payload, que incluye el objeto del usurio logueado usuarioDB
            //a excepcion de la propiedad contraseña, la cual se ha determinado en models/usuario no mostrarse por razones de seguridad
            //aun asi copiando y pegando este codigo nos dice que la firma (signature no es valida), la cual se le validaria si tambien le pasaramos la semilla o seed definida 'este-es-el-seed-desarrollo'
    })

})


module.exports = app; //vamos a exportar app y con ello las rutas