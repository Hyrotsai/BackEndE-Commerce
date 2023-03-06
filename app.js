const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config') //! Para que se puedan entraer variables del .env
const authJwt = require('./helper/jwt')
const errorHandler = require('./helper/error-handler')

app.use(cors())
app.options("*", cors())

//! Middleware
app.use(express.json()) //!Para que pueda traer la informacion json
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler)

//! Routers
const categoryRouters = require('./routers/categories')
const productsRouters = require('./routers/products')
const userRouters = require('./routers/users')
const ordersRouters = require('./routers/orders')

const api = process.env.API_URL

app.use(`${api}/categories`, categoryRouters)
app.use(`${api}/products`, productsRouters)
app.use(`${api}/users`, userRouters)
app.use(`${api}/orders`, ordersRouters)


//! Database Mongoose
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
    .then(() => {
        console.log("Database Connection is ready!")
    })
    .catch((err) => {
        console.log(err)
    })

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Servidor escuchando en el puerto 3000")
    console.log("API : ", api)
})