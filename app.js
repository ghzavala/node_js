require("dotenv").config()
const express = require("express")
const app = express()
const nodemailer = require("nodemailer")
const joi = require("joi")
const expressFileUpload = require("express-fileupload")
const { MongoClient, ObjectId } = require("mongodb") // porque la app es cliente || si fuera servidor MongoServer, por ej

const API = express.Router()

const { 
    SERVER, USER, PASS, PORT,
    MONGODB_BASE, MONGODB_HOST, MONGODB_PASS, MONGODB_USER} = process.env

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: SERVER,
    port: PORT,
    auth: {
        user: USER,
        pass: PASS
    }
});

const schema = joi.object({
    nombre : joi.string()
        .min(3)
        .max(30)
        .required(),
    
    apellido : joi.string()
        .min(3)
        .max(30)
        .required(),
    
    correo : joi.string()
        .email({minDomainSegments : 2, tlds : { allow : ["com", "net", "tech"]}})
        .required(),

    asunto : joi.number()
        .integer()
        .required(),

    mensaje : joi.string()
    .required()
})

const ConnectionString = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}/${MONGODB_BASE}?retryWrites=true&w=majority`

const ConnectionDB = async () => {
    const client = await MongoClient.connect( ConnectionString, { useUnifiedTopology : true } ) 
    
    return await client.db( "Catalogo" )
}

app.listen( port )
// Middlewares //
app.use( express.static("public") ) // las configuraciones que le damos
app.use( express.json() ) // de application/json a Object
app.use( express.urlencoded({ extended : true }) ) //convierte de x-www-form-urlencoded a objeto
app.use( expressFileUpload() )

app.use("/api", API)

/*
Plantilla modelo para "endpoints" de express()

app.TIPO_HTTP("/RUTA", (req, res) => { LO QUE TIENE QUE HACER})
*/

app.post("/enviar", (req, res) => {

    const contacto = req.body
    const { archivo } = req.files

    const ubicacion = __dirname + "/public/uploads/" + archivo.name
    archivo.mv( ubicacion, error => {
        if(error){
            console.log("No se movio")
        }
    } )


    console.log( ubicacion )
    return res.end("Mira la consola")


    const validate = schema.validate( contacto, { abortEarly : false } )  // abortEarle false evita que corte en el primer error
    
    if ( error ){

        const msg = {
            ok: false,
            error : error.details.map( e => e.message.replace(/"/g, ""))
        }

        res.json( msg)
    } else {
        miniOutlook.sendMail({
            from: contacto.correo, // sender address
            to: process.env.USER, // list of receivers
            replyTo: contacto.correo, // dirección para responder el correo
            subject: `Asunto #${contacto.asunto}`, // Subject line
            html: `<blockquote>${contacto.mensaje}</blockquote>`, // html body
        });

        res.end("Ahora vamos a enviar un email de contacto :O")
    }
    /*
    if( validate.error === undefined ){
        
        miniOutlook.sendMail({
            from: contacto.correo, // sender address
            to: process.env.USER, // list of receivers
            replyTo: contacto.correo, // dirección para responder el correo
            subject: `Asunto #${contacto.asunto}`, // Subject line
            html: `<blockquote>${contacto.mensaje}</blockquote>`, // html body
        });

        res.end("Ahora vamos a enviar un email de contacto :O")
        
    } else {
        console.log(validate.error)
        res.end(`El ${validate.error.details[0].context.key} ingresado no es correcto. Por favor verifique los datos.`)
        
    }
    */
})

/************** API ***************************/
//***** Create ****/
API.post("/v1/pelicula", async (req, res) => {
    //db.getCollection('Peliculas').find({})

    const db = await ConnectionDB()
    
    const respuesta = {
        msg: "Acá vamos a crear peliculas..."
    }
    
    res.json(respuesta)
})

//***** Read ****/
API.get("/v1/pelicula", async (req, res) => {
    
    //console.log( req.query._id ) // Datos HTTP desde query string

    const db = await ConnectionDB()

    const peliculas = await db.collection('Peliculas').find({}).toArray()
    
    res.json(peliculas)
})

API.get("/v1/pelicula/:id", async (req, res) => {

    const { id } = req.params
    
    // acá viene la validación del id

    try { 

        const db = await ConnectionDB()

        const peliculas = await db.collection('Peliculas')
    
        const busqueda = { "_id" : ObjectId( id ) }  // porque MongoDB asigna una función id
    
        const resultado = await peliculas.find( busqueda ).toArray()

        return res.json( {ok : true, resultado} )

    } catch(error) {

        return res.json( {ok : false, msg : "Error en la conexión a la base de datos"} )

    }

})
//***** Update ****/
API.put("/v1/pelicula", async (req, res) => {
    
    const db = await ConnectionDB()
    
    const respuesta = {
        msg: "Acá vamos a actualizar peliculas..."
    }
    
    res.json(respuesta)
})
//***** Delete ****/
API.delete("/v1/pelicula", async (req, res) => {
    
    const db = await ConnectionDB()
    
    const respuesta = {
        msg: "Acá vamos a borrar peliculas..."
    }
    
    res.json(respuesta)
})