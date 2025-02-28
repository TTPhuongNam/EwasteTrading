const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET route to render the product listing page
router.get('/lists', async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await Product.find().populate('seller', 'username');
        if (!products || products.length === 0) {
            return res.status(404).send('No product found');
        }
        res.render('buy-sell', { products, userId: req.session.userId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching products.');
    }
    try {
        const { search, category, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            query.category = category; // Add category filter
        }

        const products = await Product.find(query)
            .populate('seller', 'username')
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('buy-sell', {
            products,
            userId: req.session.userId,
            search,
            category,
            page: parseInt(page),
            totalPages,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching products.');
    }
    
});

// POST route to handle product listing
router.post('/lists', async (req, res) => {
    const { name, description, price, category } = req.body;

    if (!name || !description || !price) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Create a new product
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            seller: req.session.userId, // Associate the product with the logged-in user
        });

        // Save the product to the database
        await newProduct.save();

        // Redirect to the product listing page after successful submission
        res.redirect('/products/lists');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while listing the product.');
    }
});

//GET route for product detail
router.get('/details/:id', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'username');
        if(!product) {
            return res.status(404).send('Product not found!');
        }
        res.render('product-details', {product, userId: req.session.userId});
    }  catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching product details!');
    }
});

// GET route to render the edit product form
router.get('/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found.');
        }
        res.render('edit-product', { product, userId: req.session.userId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching product for editing.');
    }
});

// POST route to handle product updates
router.post('/edit/:id', async (req, res) => {
    const { name, description, price } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found.');
        }

        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        await product.save();

        res.redirect('/products/details/' + product._id);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while updating the product.');
    }
});
// POST route to handle product deletion
router.post('/delete/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found.');
        }

        await Product.deleteOne({ _id: req.params.id });
        res.redirect('/products/lists');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while deleting the product.');
    }
});

router.get('/lists', async (req, res) => {
    try {
        const { search } = req.query;
        let products;

        if (search) {
            // Search for products by name or description
            products = await Product.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ],
            }).populate('seller', 'username');
        } else {
            // Fetch all products
            products = await Product.find().populate('seller', 'username');
        }

        res.render('buy-sell', { products, userId: req.session.userId, search });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching products.');
    }
});
module.exports = router;