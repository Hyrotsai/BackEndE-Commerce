const mongoose = require('mongoose')

//! Crea un esquema para la base de datos
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        required: ''
    },
    apartment: {
        type: String,
        required: ''
    },
    city: {
        type: String,
        required: ''
    },
    zip: {
        type: String,
        required: ''
    },
    country: {
        type: String,
        required: ''
    },
})

userSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

userSchema.set('toJSON', {
    virtuals: true
})

//! Se le asigna el esquima+
exports.User = mongoose.model('User', userSchema)
exports.userSchema = userSchema