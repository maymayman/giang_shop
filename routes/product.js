const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');

router.get('/:objectId', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const product = await ProductModel.findByObjectId(req.params.objectId, user);
    res.render('products/detail', { menus, product, user });
  } catch (error) {
    next(error);
  }
});

router.get('/', async function(req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const menuId = req.query.menu || '';
    const categoryId = req.query.category || '';
    const keyword = req.query.keyword || '';

    const menus = await MenuModel.find(true);
    const products = await ProductModel.find({
      page, limit, menuId, categoryId, user, keyword
    });
    const count = await ProductModel.count({
      menuId, categoryId, user, keyword
    });

    res.render('search_products', {
      menus, 
      products, 
      user, 
      page, 
      nextPage: page + 1, 
      prePage: page - 1, 
      keyword,
      categoryId,
      menuId,
      totalPage: count ? Math.ceil(count/limit) : 0
    });
  } catch (error) {
    next(error);
  }
});

router.post('/search', async function(req, res, next) {
  const keyword = req.body.keyword;

  res.redirect(`/product?keyword=${keyword}`);
});

module.exports = router;