const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');

router.get('/:objectId', async function(req, res, next) {
  try {
    const menus = await MenuModel.find(true);
    res.render('products/detail', { menus });
  } catch (error) {
    next(error);
  } 
});

module.exports = router;