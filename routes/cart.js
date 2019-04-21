const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const OrderModel = require('../models/Order');

router.get('/', async function(req, res, next) {
  try {
    
    const user = req.user;
    const cookies = req.cookies;
    const cartProducts = cookies.cartProducts ? JSON.parse(cookies.cartProducts) : undefined;
    const products = cartProducts ? Object.values(cartProducts) : [];
    const menus = await MenuModel.find(true);
    
    let totalAmount = 0;

    products.forEach(product => {
      totalAmount = totalAmount + product.price * product.count;
    });

    res.render('cart', { menus, products, totalAmount, user });
  } catch (error) {
    next(error);
  }
});

router.post('/order', async function(req, res, next) {
  try {
    const cookies = req.cookies;
    const cartProducts = cookies.cartProducts ? JSON.parse(cookies.cartProducts) : undefined;
    const products = cartProducts ? Object.values(cartProducts) : [];
    const sessionToken = cookies['X-Session-Token'] || '';
    const deliveryInfo = req.body.deliveryInfo;
    const storeIds = [];
    
    

    console.log(req.body);
    
    let totalAmount = 0;

    products.forEach(product => {
      totalAmount = totalAmount + product.price * product.count;
      if (product.storeId && !storeIds.includes(product.storeId)){
        storeIds.push(product.storeId);
      }
    });

    if (!storeIds || !deliveryInfo){
      return res.json({success: false, error: 'Invalid data ', data: null});
    }
    const order = await OrderModel.create(cartProducts, totalAmount, sessionToken, deliveryInfo, storeIds);

    res.json({success: true, error: null, data: { order: order } });
  } catch (error) {
    res.json({success: false, error: error, data: null});
  }
});

module.exports = router;