const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');

router.get('/', async function(req, res, next) {
  try {
    const menus = await MenuModel.find(true);
    // const product = await ProductModel.findByObjectId(req.params.objectId);
    res.render('cart', { menus });
  } catch (error) {
    next(error);
  }
});

module.exports = router;