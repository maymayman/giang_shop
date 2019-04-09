const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');

router.get('/', async function(req, res, next) {
  try {
    const cookies = req.cookies;
    const cartProducts = cookies.cartProducts ? JSON.parse(cookies.cartProducts) : undefined;
    const products = cartProducts ? Object.values(cartProducts) : [];
    const menus = await MenuModel.find(true);
    
    let totalAmount = 0;

    products.forEach(product => {
      totalAmount = totalAmount + product.price * product.count;
    });

    res.render('cart', { menus, products, totalAmount });
  } catch (error) {
    next(error);
  }
});

module.exports = router;