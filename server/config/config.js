//=============================
// Puerto
//============================

process.env.PORT = process.env.PORT || 3000;



//=============================
// Entorno 
//============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//=============================
// Vencimiento del token 
//============================

//60 segundos 
//60 minutos
//24 horas
//30 días

process.env.CADUCIDAD_TOKEN = '48h';


//=============================
// SEED DE AUTENTICACION 
//============================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'; //voy a declararme en heroku una variable que sea una seed de mi aplicacion 


//=============================
// database 
//============================

let urlDB;

if (process.env.NODE_ENV == 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}


process.env.urlDB = urlDB;



//=============================
// Google Client ID
//============================
process.env.CLIENT_ID = process.env.CLIENT_ID || "71542643149-sqe41nc0ggt7nhn22ouc4sfkai697kai.apps.googleusercontent.com";

//=============================
// tokens
//============================
//es una forma de authenticacioón segura, en contrparte con las variables de sesión que requieren un equipo muy robusto para poder soportar multiples peticiones
// Un token lo conforman tres partes el header, el payload y la firma

//el header, incluye informacion del algoritmo que usa el token y el tipo del token
//el payload incluye la informacion que querramos incluir, la fecha de expiracionm de emision, es un encriptacion de dloble via se puede encriptar y desencriptar
//la firma es la parte del token, en la que se valida que este sea valido, muestra si el token a recibido manipulacion o algo por el estilo, se configura del lado del backenc
//la firma es lo más importante cuando estamos trabajando en node

//el local storage es un lugar donde se almacena informacion para que permanezca persistente en el equipo, antes manejado como cookies- en este caso informacion de last token
//comparte informacion por dominio, cuando estemos en otro dominio, va tener ptrp apartado de  informacion almacenada en el local storage

//el local storage es facilmente manipulable por alguien con conocimientos de javascript puede obtener ese token, lo puede manipular actualizar el local estorage y nuestra aplicacion puede enviar ese token falso
// por lo que es responsabilidad del lado del back debe verificar que ese token no ha sido maleado

//el sesion storage es un lugar donde se almacena info que permanece hasta que se cierra el navegador