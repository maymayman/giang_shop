const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const products = await ProductModel.find({skip: 0, limit: 10});

    res.render('index', { menus, products, user });
  } catch (error) {
    next(error);
  } 
});

module.exports = router;
