const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID); //este esl client ID


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


//Configuraciones de Google


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); //obtenemos el payload de ese token y de ahi podemos obtener alguna info de su cuenta de google
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);
    // const userid = payload['sub'];

    return { //mandamos un objeto personalizado despues de la autenticación, se podria decir verufy nos regresa un objeto de google
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}
//verify().catch(console.error);


app.post('/google', async(req, res) => { //pero para poder usar un await se tiene que estar dentro de una funcion async
    let token = req.body.idtoken;
    //idtoken, esto es de lo que nosotros vamos a mandar el post, y que lo generó google

    //como verify es una promesa para que se le asigne el valor a googleUser tenemos que colocarle un await
    //pero para poder usar un await se tiene que estar dentro de una funcion async
    let googleUser = await verify(token)
        .catch(e => { //podria pensarse que el token es correcto ya que el mismo google lo genero, es una autenticacion directa,  pero es posible que el token falle, este manpulado o haya expirado, por lo que nos retornara un error
            return res.status(403).json({
                ok: false,
                err: e //el error que venga de e, token invalido, credenciales incorrectas etc

            });
        })
        //si pasa el catch nos regresa el objeto de google con cierta info del usuario

    /*
        res.json({ //si todo funciona bien va regresar el objeto personalizado de google
            usuario: googleUser
        })

    */

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ //internal error
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({ //500 error interno del servidor
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticacion normal' //por que este usuario de auntentico con credenciales normales, sin usar google
                    }
                });
            } else { //si fuera un usuario autenticado anteriormente por google, en este caso renovariaos su token
                //tendriamos que crear nuestro propio token jkt

                let token = jwt.sign({
                        usuario: usuarioDB //en el token decidimos guardamos la informacion del usuario
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //aqui se le manda el secret y el expireIn (osea el tiempo que tarda en expirar el token, en este caso se configuro que expira en 30 dias)

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //si el usuario no existe en nuestra base de datos
            //si el usuario usa por primer vez sus credenciales validas de google para crear su usuario en nuestra base de datos

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //esta carita es solo para que pase las validaciones de nuestra base de datos, se va generar el hash
            //de este password no se va enterar el usuario
            //el password no lo vamos a ocupar en lo absoluto, entiendo que el usuario una vez registrado de esta manera, de esta misma manera se tiene que loguear

            //por lo que nunca le pedirian su passwrod, ya que usario del su cuenta de google en api google signIn



            /*esto de arriba es lo mismo que esto
            let usuario = new Usuario({ //con esto creamos una nueva instancia de ese schema, con todas las propiedades y metodos que trae mongoose
                nombre: body.nombre,
                email: body.email,
                password: bcrypt.hashSync(body.password, 10),
                //se aplica el bcrypt al password, aplicandolo con modo sincrono, se le pasa el campo contraseña y las nuemero de veces que se le aplica la encriptacion
                role: body.role
            });
            */
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({ //500 error interno del servidor
                        ok: false,
                        err
                    });
                };


                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

                //de esta manera creamos un nuevo registro en la base de datos con la api de google para autenticar a un nuevo usuario
            });


        }
    })

});
module.exports = app; //vamos a exportar app y con ello las rutas