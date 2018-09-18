const express = require('express');
const app = express();

const bodyParser = require('body-parser');
require('./config/config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//app.use  son middlewares son funciones que se va disparar cada vez que el pase por aqui el codigo, cada vez que hagamos una peticiones

// parse application/json
app.use(bodyParser.json())





app.get('/', (req, res) => {
    res.json('hola mundo');
})


app.get('/usuario', (req, res) => {
    res.json('get Usuario');
})


app.post('/usuario', (req, res) => {

    let body = req.body; // cuando se envie informacion de peticiones el body-parser va procesarlo, como un formulario
    if (body.nombre === undefined) {
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


})

app.put('/usuario/:id', (req, res) => { //:id esta indicacion, con los dos puntos significa que seguir despues del usuario/ cualquier cosa, el id es un nombre aleatorio

    let id = req.params.id;
    //el :id es el nombreuna variable que  tiene que machar con el nombre de la propiedad id del req.params.id; 
    //o sea que si en la ruta especificamos app.put('/usuario/:loquesea', en el request params debe ser  req.params.loquesea; 
    res.json({
        id // y a este valor lo guardamos en esesta url
    });
})


app.delete('/usuario', (req, res) => {
    res.json('delete Usuario');
})



app.listen(process.env.PORT, () => {
    console.log('Escuchando peticiones en el puerto: ', process.env.PORT)
})