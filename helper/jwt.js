const expressJwt = require('express-jwt')

function authJwt() {
    const secret = process.env.secret
    const api = process.env.API_URL
    return expressJwt.expressjwt({
        secret,
        algorithms: ['HS256'],
        // isRevoked: isRevoked
    }).unless({ //INFO Linea para saber a que rutas NO NECESITARA el token
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'POST'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'POST'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'POST'] },
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

//! NO FUNCIONA NO SE POR QUE
// async function isRevoked(req, payload, done) {

//     if (!payload.payload.isAdmin) {
//         done(null, true)
//     }

//     done()
// }

module.exports = authJwt

