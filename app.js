require("dotenv").config()
const express = require("express")
const app = express()
const nodemailer = require("nodemailer")
const joi = require("joi")
const expressFileUpload = require("express-fileupload")

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: process.env.SERVER,
    port: process.env.PORT,
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
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

app.listen( port )
// Middlewares //
app.use( express.static("public") ) // las configuraciones que le damos
app.use( express.json() ) // de application/json a Object
app.use( express.urlencoded({ extended : true }) ) //convierte de x-www-form-urlencoded a objeto
app.use( expressFileUpload() )

/*
Plantilla modelo para "endpoints" de express()

app.TIPO_HTTP("/RUTA", (req, res) => { LO QUE TIENE QUE HACER})
*/

app.post("/enviar", (req, res) => {
    const contacto = req.body
    const { archivo } = req.files

    console.log(req.files)

    const ubicacion = __dirname + "/public/uploads/" + archivo.name
    archivo.mv( ubicacion )
    console.log( ubicacion )
    return res.end("Mira la consola")


    const validate = schema.validate( contacto )
    
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
})