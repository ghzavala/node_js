require("dotenv").config()
const express = require("express")
const app = express()
const nodemailer = require("nodemailer")
const joi = require("joi")
const expressFileUpload = require("express-fileupload")
const { MongoClient, ObjectId, ObjectID } = require("mongodb") // porque la app es cliente || si fuera servidor MongoServer, por ej
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')

const API = express.Router()

const { 
    SERVER, USER, PASS, PORT,
    MONGODB_BASE, MONGODB_HOST, MONGODB_PASS, MONGODB_USER,
    JWT_SECRET} = process.env

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

const verifyToken = (req, res, next) => {
    
    const { _auth } = req.cookies  // extraigo token de cookie

    //jwt.verify(TOKEN, SECRET_WORD, CALLBACK)

    jwt.verify(_auth, JWT_SECRET, (error, data) => {

        if( error ){
            res.end("ERROR: Token expirado o inválido")
        } else {
            next()
        }

    })

    console.log("Estas son las cookies")
    console.log(req.cookies)
}

app.listen( port )
// Middlewares //
app.use( express.static("public") ) // las configuraciones que le damos
app.use( express.json() ) // de application/json a Object
app.use( express.urlencoded({ extended : true }) ) //convierte de x-www-form-urlencoded a objeto
app.use( expressFileUpload() )
app.use( cookieParser() )

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

    const pelicula = req.body
    
    const db = await ConnectionDB()
    
    const peliculas = await db.collection('Peliculas')

    const { result } = await peliculas.insertOne( pelicula )

    const { ok } = result

    console.log( result )

    const respuesta = {
        ok,
        msg: ok ? "Pelicula guardada correctamente" : "Error al guardar la pelicula"
    }
    
    res.json(respuesta)
})

//***** Read ****/
API.get("/v1/pelicula", verifyToken, async (req, res) => {
    
    //console.log( req.query._id ) // Datos HTTP desde query string

    const db = await ConnectionDB()

    const peliculas = await db.collection('Peliculas').find({}).toArray()
    
    res.json(peliculas)
})

API.get("/v1/peliculaST", async (req, res) => {
    
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
API.put("/v1/pelicula/:id", async (req, res) => {

    const { id } = req.params
    
    const pelicula = req.body
    
    const db = await ConnectionDB()
    
    const peliculas = await db.collection('Peliculas')

    const busqueda = { "_id" : ObjectId( id ) }

    const nuevaData = {
        $set : {  // aca van las propiedades a actualizar
            ...pelicula   // asignacion por destructuracion, convierte en variables todas las propiedades del objeto
        }
    } 

    const { result } = await peliculas.updateOne( busqueda, nuevaData )

    const { ok } = result

    console.log( result )

    const respuesta = {
        ok,
        msg: ok ? "Pelicula actualizada correctamente" : "Error al actualizar la pelicula"
    }
    
    res.json(respuesta)
})
//***** Delete ****/
API.delete("/v1/pelicula/:id", async (req, res) => {
    
    const { id } = req.params
    console.log(id)

    const db = await ConnectionDB()
    
    const peliculas = await db.collection('Peliculas')

    const { result } = await peliculas.deleteOne( {"_id" : ObjectId( id )} )

    const { ok } = result

    console.log( result )

    const respuesta = {
        ok,
        msg: ok ? "Pelicula borrada correctamente" : "Error al eliminar la pelicula"
    }
    
    res.json(respuesta)
})

/* Auth */
API.post("/v1/auth", (req, res) => {
    
    const rta = new Object()

    const { mail, pass } = req.body

    const userDB = {
        "_id":{"$oid":"5fc6ce999e319c4b99be2ba1"},
        "name":"Han Nova Solo",
        "mail":"han.nova@solo.com",
        "pass":"$2b$10$w/rIGfpLBxy7CcY/AKLuWemtnT6uk3F3hWe.lGVtOO4ZGaEJblzGO"
    }
    
    bcrypt.compare( pass, userDB.pass, ( error, resultado ) => {
        if( error ){
            return res.json({ auth : false, msg : 'No pudimos verificar tu contraseña'})
        } else if( resultado == false ) {
            return res.json({ auth : false, msg : 'La pass no coincide'})
        } else {
            // La pass coincide

            //const token = jwt.sign(PAYLOAD, CONFIG, SECRETKEY)
            const token = jwt.sign({ email : userDB.mail, name : userDB.name, expiresIn : 60 * 60 }, JWT_SECRET)
            
            // res.cookie(NOMBRE, CONTENIDO, CONFIG)
            res.cookie("_auth", token, {
                expires : new Date( Date.now() + 1000 * 60 * 3),
                httpOnly : true,
                sameSite : 'Lax', // si se puede enviar a otra web o solamente en el mismo dominio
                secure : false // permite solo por https o no
            })

            return res.json({ auth : true })

        }
    })

})

API.post('/v1/register', (req, res) => {
    const { name, mail, pass} = req.body

    bcrypt.hash(pass, 10, (error, hash) => {

        if(error){
            console.log('Como que la pass no se encripto...')
        } else {
            console.log('Tengo la password')
            console.log( hash )
            // ACA HAY QUE GUARDAR EL USUARIO CON SU PASS EN LA DB
        }
        
    })
    res.end('Mira la consola')
})