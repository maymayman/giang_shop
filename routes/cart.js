const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const OrderModel = require('../models/Order');

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

router.post('/order', async function(req, res, next) {
  try {
    const cookies = req.cookies;
    const cartProducts = cookies.cartProducts ? JSON.parse(cookies.cartProducts) : undefined;
    const products = cartProducts ? Object.values(cartProducts) : [];
    const sessionToken = cookies.sessionToken || '';
    
    let totalAmount = 0;

    products.forEach(product => {
      totalAmount = totalAmount + product.price * product.count;
    });

    const order = await OrderModel.create(cartProducts, totalAmount, sessionToken)

    res.json({success: true, error: null, data: { order: order } });
  } catch (error) {
    res.json({success: false, error: error, data: null});
  }
});

module.exports = router;