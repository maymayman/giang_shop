const express = require('express');
const router = express.Router();

const ProductModel = require('../models/Product');

router.get('/', async function(req, res, next) {
  try {
    res.render('../admin/index', {});
  } catch (error) {
    next(error);
  }
});

router.get('/product', async function(req, res, next) {
  try {
    const user = req.user;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'ACTIVE';
    const products = await ProductModel.find({skip, limit, user, status});

    res.render('../admin/product/index', { products, user });
  } catch (error) {
    next(error);
  }
});
router.get('/product/create', async function(req, res, next) {
    try {
      res.render('../admin/create-item', {});
    } catch (error) {
      next(error);
    }
  });
router.post('/product/create', async function(req, res, next) {
    try {
      const information = req.body.information ? req.body.information : null;
      const name = req.body.name ? req.body.name : null;
      const price = req.body.price ? req.body.price : null;
      const images = req.body.image ? req.body.image : null;
      const fontSize = req.body.fontSize ? req.body.fontSize : null;
      const sizeNumber = req.body.sizeNumber ? req.body.sizeNumber : null;
      const error = [];
      
      if (!name) {
      error.push('name is require.')
      }
      if (!price) {
      error.push('price is require.')
      }
      if (!images) {
      error.push('images is require.')
      }
      if (error && error.length > 0){
        return res.json({success: false, error: error, data: null});
      }
      const product = {
        information: information,
        name: name,
        price: parseInt(price),
        images: images,
        fontSize: fontSize,
        sizeNumber: sizeNumber,
      };
      const productSave = await ProductModel.create(product);
      return res.json({success: true, error: null, data: productSave});
    } catch (error) {
      next(error);
    }
  });
// router.get('/view', async function(req, res, next) {
//     try {
//       res.render('../shop/list-item', {});
//     } catch (error) {
//       next(error);
//     }
//   });

module.exports = router;