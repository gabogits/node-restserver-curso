const jwt = require('jsonwebtoken');

//=============================
// Verificar Token
//============================

//vamos a mandar los tokens a los headers y este middleware tiene que leer este header
let verificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => { //para la verificacion esta funcion necesita, de el token, la semilla (SEED)y un callback con la info del usuario logueado
        if (err) {
            return res.status(401).json({ //401 status no autorizado
                ok: false,
                err: {
                    message: "Token no válido"
                }
            })
        }
        req.usuario = decoded.usuario; //este es token del usuario que esta logueado en eeste momento decodificado
        // console.log('token', token); //asi obtenemos el token, para posteriormente 
        next(); //cuando haya obtenido esta parte pueda continuar con el codigo de la ruta /usuario app.get('/usuario', verificaToken, (req, res) => {
    })
};

//=============================
// Verifica adminRole
//============================

//inyectamos el token obtenido de un usuario logueado (Login:normal del postman) en los headers de las otras peticiones http, crear borrar y actualizar 
//el  usuario logueado debe tener el role "ADMIN_ROLE", para que las peticiones http, crear modificar y borrar se lleven a cabo
// si en la base de datos moficamos el role de    "USER_ROLE" a "ADMIN_ROLE" será necesario logiearse nuevamente y ese token actualizarlo por anterior
//ya que en ese token ya se encontraria la info del nuevo role del usuario por lo que las solicitudes http pueden llevarse a cabo
//ya que el role lo lee del payload del token

/*este es el codigo que podemos meter en la pestaña test estando en la peticion post /login para que se actualice automaticamente el token
si cambiamos sus datos en la base de datos, tal como lo hicimos con el role





let resp = pm.response.json();

if(resp.ok) { //si el usuario que se va a loguear existe
    let token = resp.token;
    pm.environment.set("token", token);
      console.log(token)
}else {  //es que el usuario no existe
    console.log("no se actualizó el token")
}


*/

let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario; // verificaToken declara y define el valor de la variable req.usuario y este segundo middleware toma esa variable y obtiene la propiedad role
    console.log(usuario.role);
    if (usuario.role === 'ADMIN_ROLE') { //es el role es valido da permiso de realizar la peticion http 

        next();
    } else { //si no se menciona que el role del usuario logueado no permite realizar estas obciones
        return res.json({ //401 status no autorizado
            ok: false,
            err: {
                message: "El usuario no es administrador"
            }
        })
    }

};



module.exports = {
    verificaToken,
    verificaAdmin_Role
}