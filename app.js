const express = require("express")
const app = express()
const nodemailer = require("nodemailer")

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'mariam.franecki@ethereal.email',
        pass: 'Pe2gmhctps6fPDVc77'
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
        to: "guille.h.zavala@gmail.com", // list of receivers
        subject: `Asunto #${contacto.asunto}`, // Subject line
        html: `<blockquote>${contacto.mensaje}</blockquote>`, // html body
    });

    res.end("Desde acá vamos a enviar un email de contacto :O")
})