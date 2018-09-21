const express = require('express');
const Usuario = require('../models/usuario');

const bcrypt = require('bcrypt');

const _ = require("underscore"); //undercore entre el monton de funcionalidades se encuentra pick, regresa una copia del objeto, filtrando solo los valores, que yo quiero, 

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion'); //podemos importar asi solo la funcion o podriamos importar todo el archivo
// require('../middlewares/autenticacion'); esta es la otra forma
const app = express();

app.get('/', (req, res) => {
    res.json('hola mundo');
})

7
app.get('/usuario', verificaToken, (req, res) => {
    /*
    return res.json({ //aqui obtenemos la informacion del usuario, que paso por la verificacion del token, 
        //este info la pasa el midleware verificaToken y corresponde al usuario logueado en este momento
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
    })
    */
    let desde = req.query.desde || 0;
    desde = Number(desde); //desde lo vamos vamos a obtener de la url (/usuario?desde=10) -si hay un parametro desde en la url toma ese valor, si no por default tiene 0
    //lo que quiere decir que mostrará apartir del primer registro de a base de datos (0)

    let limite = req.query.limite || 20; //de igual forma el limite lo puede obtener de la url, aunque tambien lo podemos especificar en el metodo
    limite = Number(limite);

    let status = req.query.estado || true; //de igual forma el limite lo puede obtener de la url, aunque tambien lo podemos especificar en el metodo





    Usuario.find({ estado: status }, 'nombre email role estado google img') // 'nombre email role estado google img' con este parametros elegimos las propiedades que queremos mostrar de cada registro
        .skip(desde) //salta los primeros 5  y apartir de ahi puedes mostrar
        .limit(limite)
        .exec((err, usuarios) => { //ejecuta el find
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({ estado: status }, (err, conteo) => { //podemos imprimir la cantidad de registros que tiene nuestra collección
                //los mismos parametros que se mandan en find por ejemplo.find({ google: true }) se deben de mandar en count .count({ google: true }
                //asi nos traeria todos los registros que sean hecho atravez de la cuenta de google
                res.json({
                    ok: true,
                    usuarios,
                    //se imprime en el json la propiedad ok true y los objetos o registros  de la base de datos seleccionados
                    //este filtraje se hace en los parametros del find({}, limit(5) o desde,
                    // si no se incluyen parametros se despliegan todos los registros
                    cuantos: conteo

                })


            })
        })


});
/*
bcrypt :hash de una sola vía, que aunque alguien obtenga toda la cadena de caracteres de encriptacion que se crea con bcrypt,
 no va ser posible reconstruirla o transformarla a su forma simple/original "lo que el usuario escribio en contraseña"
*/


app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => { //asi se manda dos midlewares [verificaToken, verificaAdmin_Role]

    let body = req.body; // cuando se envie informacion de peticiones el body-parser va procesarlo, como un formulario

    let usuario = new Usuario({ //con esto creamos una nueva instancia de ese schema, con todas las propiedades y metodos que trae mongoose
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        //se aplica el bcrypt al password, aplicandolo con modo sincrono, se le pasa el campo contraseña y las nuemero de veces que se le aplica la encriptacion
        role: body.role
    });

    usuario.save((err, usuarioDB) => { //usuarioDB la respuesta del usuario que se grabó en la base de datos
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;
        //para evitar la contraseña se vaya con el password,
        // entiendo que la guarda pero lo elimina del json que imprime

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
    /*
    if (body.nombre === undefined) { //esto fue un codigo de un ejercicio pasado
        res.status(400).json({ // hay varios códigos de respuesta que puede recibir el usuario, cuyando hay un error en el servcio
            //por ejemplo en este caso, el servicio espera un nombre para enviar la informacion, si no lo enviamos recibimos eeste error tipo 400 bad request,
            //para informar al usuario que hubo un error  
            ok: false,
            mensaje: "El nombre es necesario"
        })
    } else {
        res.json({
            persona: body
        });
    }
    */


})

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => { //:id esta indicacion, con los dos puntos significa que seguir despues del usuario/ cualquier cosa, el id es un nombre aleatorio
    //el :id es el nombreuna variable que  tiene que machar con el nombre de la propiedad id del req.params.id; 
    //o sea que si en la ruta especificamos app.put('/usuario/:loquesea', en el request params debe ser  req.params.loquesea; 
    let id = req.params.id;

    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role ', 'estado']); //undercore entre el monton de funcionalidades se encuentra pick, regresa una copia del objeto, filtrando solo los valores, que yo quiero, 
    //como parametro escogemos las propiedades del objeto que pueden ser actualizadas

    //delete body.password esta es una manera no eficiente actualizar los campos

    //delete body.google

    //otra forma de hacerlo Usuario.findById (id,  (err, usuarioDB) => { //usando el modelo buscamos un usuario
    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => { //aqui busca por el id y lo actualiza si lo encuentra
        //este metodo, usa el id, lo que queremos actualizar y un callback, el cual va recibir un error o un usuario de  base de datos
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB //aqui nos regresaba el usuario antes de la actualización, se tiene que pasar un tercer parametro  { new:true }, para que el postman imprima el usuario actualizado
        });
    })

    //si un campo no existe en el schema, mongoose lo ignora y no agrega y no agrega otro campo, por ejemplo haciendo una prueba en postman agregando otro key, podriamos comprobarlo

})




app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {



    let id = req.params.id;

    let cambiaEstado = {
            estado: false
        }
        //hay dos formas de borrar un registro de la base de datos
        //uno es con delete, borrandolo fisicamente y permanentemente de la base de datos 
        /*
        Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {    
        })
        */



    //y otro es cambiar su estado a inactivo, en que sigue existiendo en la base de datos pero no se toma en cuenta en las consultas
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => { //aqui en un objeto se le puede mandar las propiedades que quieres cambiar


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        };
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })


})


module.exports = app; //vamos a exportar app y con ello las rutas