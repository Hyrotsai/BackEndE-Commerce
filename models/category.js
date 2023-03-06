const mongoose = require('mongoose')

//! Crea un esquema para la base de datos
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
})

//! Se le asigna el esquima+
exports.Category = mongoose.model('Category', categorySchema)