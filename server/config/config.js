//=============================
// Puerto
//============================

process.env.PORT = process.env.PORT || 3000;



//=============================
// Entorno 
//============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//=============================
// database 
//============================

let urlDB;

if (process.env.NODE_ENV == 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:abarcafe1@ds263642.mlab.com:63642/cafe'
        //abarudemy1
}


process.env.urlDB = urlDB;