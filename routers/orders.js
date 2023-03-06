const { Order } = require('../models/order')
const express = require('express')
const { OrdersItem } = require('../models/order-item')
//! Router de express
const router = express.Router()

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 })
    if (orderList.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.send(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name')
        .populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } })
    if (order.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.send(order)
})

router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrdersItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save()

        return newOrderItem._id
    }))
    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemsId) => {
        const orderItem = await OrdersItem.findById(orderItemsId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b) => { a + b, 0 })

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,

    })
    order = await order.save()

    if (!order) return res.status(404).send("The order cannot be created!")

    res.send(order)
})

router.put("/:id", async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id,
        {
            status: req.body.status
        }, { new: true })

    if (!order) return res.status(404).send("The order cannot be created!")

    res.send(order)
})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrdersItem.findByIdAndDelete(orderItem)
            })
            return res.status(200).json({ sucess: true, message: 'The order deleted' })
        } else {
            return res.stats(404).json({ sucess: false, message: "Order not found!" })
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err })
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalSales })
})

router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count).clone()
    if (!orderCount) {
        res.status(500).json({ sucess: false })
    }
    res.send({
        orderCount: orderCount
    })
})

router.get(`/get/userorders/:id`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.id }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 })
    if (userOrderList.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.send(userOrderList)
})

module.exports = router

/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
    "shippingAddress1" : "Flowers Street , 45",
    "shippingAddress2" : "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5fd51bc7e39ba856244a3b44"
}

 */