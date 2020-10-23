const express = require("express")
const app = express()

const port = 1000   //mas allá del 1000 usualmente están disponibles

app.listen( port )
app.use( express.static("public") ) // las configuraciones que le damos
app.use( express.urlencoded({ extended : true }) )

/*
Plantilla modelo para "endpoints" de express()

app.TIPO_HTTP("/RUTA", (req, res) => { LO QUE TIENE QUE HACER})
*/

app.post("/enviar", (req, res) => {
    const contacto = req.body

    console.log(contacto)
    res.end("Desde acá vamos a hacer algo muy loco")
})