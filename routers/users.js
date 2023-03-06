const { User } = require('../models/user')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//! Router de express
const router = express.Router()

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash')
    if (userList.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.send(userList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')

    if (!user) {
        res.status(500).json({ mnessage: "The user with the given ID was not found" })
    }
    res.status(200).send(user)

})

router.post(`/register`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
    })
    category = await user.save()

    if (!user) return res.status(404).send("The user cannot be created!")

    res.send(user)
})

router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id)
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
    },
        { new: true })

    if (!user) {
        return res.status(400).send('The user cannot be created!')
    }

    res.send(user)
})

router.post('/login', async (req, res) => {
    res.header()
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret
    if (!user) {
        return res.status(400).send('The user not found!')
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )
        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(401).send('Password is wrong!')
    }
})

router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        street: req.body.street,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
    })
    user = await user.save()

    if (!user) {
        return res.status(400).send('The user cannot be created')
    }
    res.status(200).send('User created')
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ sucess: true, message: 'The user deleted' })
        } else {
            return res.stats(404).json({ sucess: false, message: "user not found!" })
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err })
    })
})

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments((count) => count).clone()

    if (!userCount) {
        res.status(500).json({ sucess: false })
    }
    res.send({
        userCount: userCount
    })
})

module.exports = router