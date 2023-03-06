const { Category } = require('../models/category')
const express = require('express')
//! Router de express
const router = express.Router()

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find()
    if (categoryList.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.status(200).send(categoryList)
})

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(500).json({ mnessage: "The category with the given ID was not found" })
    }
    res.status(200).send(category)

})

router.post(`/`, async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })
    category = await category.save()

    if (!category) return res.status(404).send("The category cannot be created!")

    res.send(category)
})

router.put("/:id", async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, { new: true })

    if (!category) return res.status(404).send("The category cannot be created!")

    res.send(category)
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ sucess: true, message: 'The category deleted' })
        } else {
            return res.stats(404).json({ sucess: false, message: "Category not found!" })
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err })
    })
})

module.exports = router