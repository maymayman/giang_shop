const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');

router.get('/:objectId', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const product = await ProductModel.findByObjectId(req.params.objectId);
    res.render('products/detail', { menus, product, user });
  } catch (error) {
    next(error);
  }
});

router.get('/', async function(req, res, next) {
  try {
    const user = req.user;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const menuId = req.query.menu || '';
    const categoryId = req.query.category || '';

    const menus = await MenuModel.find(true);
    const products = await ProductModel.find({skip, limit, menuId, categoryId});
    

    res.render('search_products', { menus, products, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;