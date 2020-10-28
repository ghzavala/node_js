require("dotenv").config()
const express = require("express")
const app = express()
const nodemailer = require("nodemailer")

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: process.env.SERVER,
    port: process.env.PORT,
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});

const miniGmail = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'ghz.metrogas@gmail.com',
        pass: 'metrogas'
    }
});


app.listen( port )
app.use( express.static("public") ) // las configuraciones que le damos
app.use( express.urlencoded({ extended : true }) )

/*
Plantilla modelo para "endpoints" de express()

app.TIPO_HTTP("/RUTA", (req, res) => { LO QUE TIENE QUE HACER})
*/

app.post("/enviar", (req, res) => {
    const contacto = req.body

    miniOutlook.sendMail({
        from: contacto.correo, // sender address
        to: process.env.USER, // list of receivers
        replyTo: contacto.correo, // dirección para responder el correo
        subject: `Asunto #${contacto.asunto}`, // Subject line
        html: `<blockquote>${contacto.mensaje}</blockquote>`, // html body
    });

    console.log(process.env.USER)

    res.end("Desde acá vamos a enviar un email de contacto :O")
})