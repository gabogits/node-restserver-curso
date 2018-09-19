const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
// uniqueValidator es un plugin para manejar errores cuuando el valor del campo esta repetido, para que de esta manera sea facil manejarlo desde el frontend

let Schema = mongoose.Schema;

let rolesValidos = {

    //en las pruebas del postman al imprimir el json de error, en la parte abajo hay una propiedad llamada "message", que concatena todos los errores del los campos
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({ //el schema es el cascaron y los objetos de los campos que integran la coleccion
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true, //uniqueValidator: se le asigna la propiedad unique
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es necesario'] //aqui podemos disparar unos mensajes cuando esta condicion no se cumpla
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true,

    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioSchema.methods.toJSON = function() { // no convertirlo en funcion flecha por que necesitamos el this y en la funcion flecha esto funciona diferente
    //al querer imprimir el  el json con este schema, se ejecuta este metodo, en la que borramos, el campo de password para que no se imprima en el objeto
    let user = this;
    let userObject = user.toObject();
    delete userObject.password; //esto es otra alternativa a usuarioDB.password = null;

    return userObject;
}

//Duda, por que tanto hincapie en quitar password del objeto que imprimimos 
//si ese objeto entiendo solo lo ocupamos para checar que los metodos html funciones en fase de desarrollo
//o la idea es que esa info si se le va mostrar al usuario en etapa de produccion

usuarioSchema.plugin(uniqueValidator, { //uniqueValidator: y se le indica el plugin que ocupa el schema
    message: '{PATH} debe ser unico'
})

//exportamos este modelo
module.exports = mongoose.model('Usuario', usuarioSchema) //el primer parametro es nombre como nosotros nombramos el esquema 'el alias y el usuarioSchema es el nombre del schema para hacer refrencia al alias
    //un modelo es para crear inserciones, actualizacion utilizar funcionalidades ya creado por mongo e implementar las propias