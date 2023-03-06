const mongoose = require('mongoose')

//! Crea un esquema para la base de datos
const ordersItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

//INFO Se le asigna el esquema
exports.OrdersItem = mongoose.model('OrdersItem', ordersItemSchema)