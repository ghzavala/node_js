/*
require("dotenv").config()

console.log(process.env.USER)
console.log(process.env.PASS)
console.log(process.env.PORT)
*/

const joi = require("joi")

const datos = {
    nombre : "Guillermo",
    apellido : "Zavala",
    email : "hola@gmail.tech",
    asunto : 1,
    mensaje : "Esto es una prueba"
}

const isUndefined = (valor) => {

}

const schema = joi.object({
    nombre : joi.string()
        .min(3)
        .max(30)
        .required(),
    
    apellido : joi.string()
        .min(3)    
        .max(30)
        .required(),
    
    email : joi.string()
        .email({minDomainSegments : 2, tlds : { allow : ["com", "net", "tech"]}})
        .required(),

    asunto : joi.number()
        .integer()
        .required(),

    mensaje : joi.string()
    .required()
})

let valor = {}

const valorA = schema.validate( datos )

//console.log(valorA.error.details[0].context.key)

if( valorA.error === undefined ){
    console.log("validacion ok")
} else {
    console.log(`El ${valorA.error.details[0].context.key} ingresado no es válido. Por favor verifique los datos.`)
}


/*
joi.validate(datos, schema, (err, value) => {
    const id = Math.ceil(Math.random() * 9999999);

    if (err) {
        console.log(err)
    } else {
        console.log("OK!!!")
    }
})
*/