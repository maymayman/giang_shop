const express = require('express');
const router = express.Router();

const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');
const MenuModel = require('../models/Menu');

router.get('/history', async function(req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'NEW';
    const keyword = req.query.keyword || '';
    
    const menus = await MenuModel.find(true);
  
    const orders = await OrderModel.myOrders({
      user, page, limit, status
    });
    
    const count = await OrderModel.count({user, status});
    res.render('./order/history_order', {
      menus,
      orders,
      user,
      page,
      status,
      nextPage: page + 1,
      prePage: page - 1,
      keyword,
      limit,
      totalPage: count ? Math.ceil(count/limit) : 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/order/:id', async function(req, res, next) {
  try {
    const user = req.user;
    const objectId = req.params.id;
  
    const menus = await MenuModel.find(true);
  
    const order = await OrderModel.findById(objectId, user);
    
    if (!order) {
      return next('Order Not Found');
    }
    
    const productIds = Object.keys(order.items);
    const products = await ProductModel.findByIds(productIds, user);
    
    if (products.length) {
      products.forEach(product => {
        product.count = order.items[product.objectId].count
      });
    }
    
    res.render('./order/history_order_detail', {
      menus,
      order,
      user,
      products
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;