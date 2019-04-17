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
    res.render('../admin/product/index', {products});
  } catch (error) {
    next(error);
  }
});
// router.get('/create', async function(req, res, next) {
//     try {
//       res.render('../shop/create-item', {});
//     } catch (error) {
//       next(error);
//     }
//   });
// router.get('/view', async function(req, res, next) {
//     try {
//       res.render('../shop/list-item', {});
//     } catch (error) {
//       next(error);
//     }
//   });

module.exports = router;