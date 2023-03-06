const { Product } = require('../models/product')
const express = require('express')
const { Category } = require('../models/category')
//! Router de express
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const cloudinary = require('cloudinary').v2;

// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET_KEY
});

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    //INFO Guarda la imagen en la carpeta public/uploads
    // destination: function (req, file, cb) {
    //     const isValid = FILE_TYPE_MAP[file.mimetype]
    //     let uploadError = new Error('invalid image type')

    //     if (isValid) {
    //         uploadError = null
    //     }
    //     cb(uploadError, 'public/uploads')
    // },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        // cb(null, `${fileName}-${Date.now()}.${extension}`)
        cb(null, `${fileName}-${Date.now()}`)
    }
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
    // const productList = await Product.find().select("name image -_id")
    let filter = []
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    } else {
        filter = null
    }
    const productList = await Product.find(filter).populate('category')
    if (productList.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.send(productList)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById((req.body.category))
    if (!category) return res.status(400).send('Invalid Category')
    const file = req.file
    if (!file) return res.status(400).send('No image in the request')
    const fileName = req.file.filename
    // const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
    const imageCloudinary = cloudinary.uploader.upload(`${file.path}`, { public_id: `BackEnd-Ecommerce/${fileName}` })

    //INFO para ver informacion de la imagen recien subida
    // imageCloudinary.then((data) => {
    //     console.log(data);
    //     console.log(data.secure_url);
    // }).catch((err) => {
    //     console.log(err);
    // });

    const url = cloudinary.url(`BackEnd-Ecommerce/${fileName}`, {
        width: 450,
        height: 450,
        Crop: 'fill'
    });

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        // image: `${basePath}${fileName}`,
        image: `${url}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();

    if (!product) return res.status(500).send("The product connot be created")

    return res.send(product)
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (product.length === 0) {
        res.status(500).json({ sucess: false })
        return
    }
    res.send(product)
})

router.put("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }

    const category = await Category.findById((req.body.category))
    if (!category) return res.status(401).send('Invalid Category')

    const product = await Product.findById((req.body.category))
    if (!product) return res.status(402).send('Invalid product')

    const file = req.file
    let imagepath

    if (file) {
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/upload`
        imagepath = `${basePath}${fileName}`
    } else {
        imagepath = product.image
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, { new: true })

    if (!updatedProduct) return res.status(504).send("The product cannot be created!")

    res.send(updatedProduct)
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ sucess: true, message: 'The product deleted' })
        } else {
            return res.stats(404).json({ sucess: false, message: "product not found!" })
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err })
    })
})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count).clone()
    if (!productCount) {
        res.status(500).json({ sucess: false })
    }
    res.send({
        productCount: productCount
    })
})

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)
    if (!products) {
        res.status(500).json({ sucess: false })
    }
    res.send(products)
})

// router.put("/gallery-images:id", uploadOptions.array('images', 10), async (req, res) => {
router.put("/gallery-images:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }

    const files = req.files
    let imagesPaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`

    if (files) {
        files.map(file => {
            imagesPaths.push(`${basePath}${file.fileName}`)
        })
    }
    const product = await Product.findByIdAndUpdate(req.params.id, {
        images: imagesPaths
    }, { new: true })

    if (!product) return res.status(504).send("The product cannot be created!")

    res.send(product)
})

module.exports = router