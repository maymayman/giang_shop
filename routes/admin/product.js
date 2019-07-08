const express = require('express');
const router = express.Router();

const helper = require('../../models/helper/index');
const ProductModel = require('../../models/Product');
const MenuModel = require('../../models/Menu');
const validate = require('../../models/validate/validation');

router.get('/', async function (req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'ACTIVE';
    const keyword = req.query.keyword || '';

    const products = await ProductModel.find({page, limit, user, status});
    const count = await ProductModel.count({user, status});

    res.render('../admin/product/index', {products,
      user,
      page,
      nextPage: page + 1,
      prePage: page - 1,
      keyword,
      status,
      limit,
      totalPage: count ? Math.ceil(count/limit) : 0});
  } catch (error) {
    next(error);
  }
});

router.get('/create', async function (req, res, next) {
  try {
    const user = req.user;
    const listCategory = await MenuModel.findAllCategories(true);
    res.render('../admin/product/create', {listCategory, user});
  } catch (error) {
    next(error);
  }
});

router.get('/:id/approve', async function (req, res, next) {
  try {
    const user = req.user;
    const productId = req.params.id ? req.params.id : null;
    
    if (productId && user){
      const product = await ProductModel.findByObjectIdToUpdate(productId, 'ACTIVE', user.sessionToken);
      res.redirect('/admin/product?status=ACTIVE');
    }else {
      res.json('Some thing was wrong');
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:id/delete', async function (req, res, next) {
  try {
    const user = req.user;
    const productId = req.params.id ? req.params.id : null;
    
    if (productId && user){
      const product = await ProductModel.findByObjectIdToUpdate(productId, 'DELETED', user.sessionToken);
      res.redirect('/admin/product?status=PENDING');
    }else {
      res.json('Some thing was wrong');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/create', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const sessionToken = req.user.sessionToken;
    const information = req.body.information ? req.body.information : null;
    const name = req.body.name ? req.body.name : null;
    const price = req.body.price ? req.body.price : null;
    const oldPrice = req.body.oldPrice ? parseInt(req.body.oldPrice) : null;
    const deliveryFrom = req.body.deliveryFrom ? parseInt(req.body.deliveryFrom) : null;
    const deliveryTo = req.body.deliveryTo ? parseInt(req.body.deliveryTo) : null;
    const quantity = req.body.quantity ? req.body.quantity : 0;
    const images = req.files ? req.files :  null;
    let category = req.body.category ? req.body.category : null;
    const description = req.body.description ? req.body.description : null;
    const shortDescription = req.body.shortDescription ? req.body.shortDescription : null;
    const userManual = req.body.userManual ? req.body.userManual : null;
    const linkFacebook = req.body.linkFacebook ? req.body.linkFacebook : null;
    const linkInstagram = req.body.linkInstagram ? req.body.linkInstagram : null;
    let colors = req.body.color ? req.body.color : null;
    let fontSize = req.body.fontSize ? req.body.fontSize : null;
    let sizeNumber = req.body.sizeNumber ? req.body.sizeNumber : null;
    let error;
    if(user && user.role != 'store'){
      error = 'permission denied';
    }
    if (!name) {
      error = 'name is require.';
    }
    if (!price) {
      error = 'price is require.';
    }
    if (!images) {
      error = 'images is require.';
    }
    if (!category) {
      error = 'category is require.';
    }
    if (typeof oldPrice !== 'number' && oldPrice < 0) {
      error = 'oldPrice incorrect values.';
    }
    if (typeof deliveryFrom !== 'number' && deliveryFrom < 0) {
      error = 'deliveryFrom incorrect values.';
    }
    if (typeof deliveryTo !== 'number' && deliveryTo < 0) {
      error = 'deliveryTo incorrect values.';
    }
    if (category && !Array.isArray(category)) {
      category = [category];
    }
    if (fontSize && !Array.isArray(fontSize)) {
      fontSize = [fontSize];
    }
    if (sizeNumber && !Array.isArray(sizeNumber)) {
      sizeNumber = [sizeNumber];
    }
    if (!Array.isArray(colors)) {
      colors = [colors];
    }
    if (error) {
      return res.json({success: false, error: error, data: null});
    }
    const newMenuCategory = await validate.validationMenuCategoyBeforeSave(category);
  
    const product = {
      userId: user.objectId,
      information: information,
      name: name,
      price: parseInt(price),
      quantity: parseInt(quantity),
      images: images,
      fontSize: fontSize,
      sizeNumber: sizeNumber,
      colors: colors,
      categoryIds: newMenuCategory.categoryIds,
      menuIds: newMenuCategory.menuIds,
      relativeCategoryIds: newMenuCategory.relativeCategoryIds,
      description: description,
      userManual: userManual,
      shortDescription: shortDescription,
      linkInstagram: linkInstagram,
      linkFacebook: linkFacebook,
      oldPrice,
      deliveryFrom,
      deliveryTo,
    };
    const productSave = await ProductModel.create(product, sessionToken);
    return res.json({success: true, error: null, data: productSave});
  } catch (error) {
    next(error);
  }
});

router.get('/update/:id', async function (req, res, next) {
  try {
    const user = req.user;
    const productId = req.params.id ? req.params.id : null;
    
    if (productId && user) {
      const product = await ProductModel.findByObjectId(productId, user);
      const listCategory = await MenuModel.findAllCategories();
      
      res.render('../admin/product/update', {product, user, listCategory});
    } else {
      res.json('Some thing was wrong');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/update/', helper.uploadFile, async function (req, res, next) {
  try {   
    const user = req.user;
    const sessionToken = req.user.sessionToken;
    const objectId = req.body.productId ? req.body.productId : undefined;
    const information = req.body.information ? req.body.information : undefined;
    const name = req.body.name ? req.body.name : undefined;
    const price = req.body.price ? req.body.price : undefined;
    const oldPrice = req.body.oldPrice ? parseInt(req.body.oldPrice) : null;
    const deliveryFrom = req.body.deliveryFrom ? parseInt(req.body.deliveryFrom) : null;
    const deliveryTo = req.body.deliveryTo ? parseInt(req.body.deliveryTo) : null;
    const quantity = req.body.quantity ? req.body.quantity : 0;
    const images = req.files ? req.files : undefined;
    let category = req.body.category ? req.body.category : undefined;
    const description = req.body.description ? req.body.description : undefined;
    const shortDescription = req.body.shortDescription ? req.body.shortDescription : undefined;
    const userManual = req.body.userManual ? req.body.userManual : undefined;
    const linkFacebook = req.body.linkFacebook ? req.body.linkFacebook : undefined;
    const linkInstagram = req.body.linkInstagram ? req.body.linkInstagram : undefined;
    let colors = req.body.color ? req.body.color : undefined;
    let fontSize = req.body.fontSize ? req.body.fontSize : undefined;
    let sizeNumber = req.body.sizeNumber ? req.body.sizeNumber : undefined;
    let oldImages = req.body.oldImages ? req.body.oldImages : undefined;
    let error;
   
    if (user && user.role != 'store') {
      error = 'permission denied';
    }
    if (!name) {
      error = 'name is require.';
    }
    if (!price) {
      error = 'price is require.';
    }
    if (!images && !oldImages) {
      error = 'images is require.';
    }
    if (!category) {
      error = 'category is require.';
    }
    if (!objectId) {
      error = 'product Not found';
    }
    if (typeof oldPrice !== 'number' || oldPrice < 0) {
      error = 'oldPrice incorrect values.';
    }
    if (typeof deliveryFrom !== 'number' || deliveryFrom < 0) {
      error = 'deliveryFrom incorrect values.';
    }
    if (typeof deliveryTo !== 'number' || deliveryTo < 0) {
      error = 'deliveryTo incorrect values.';
    }
    if (fontSize && !Array.isArray(fontSize)) {
      fontSize = [fontSize];
    }
    if (sizeNumber && !Array.isArray(sizeNumber)) {
      sizeNumber = [sizeNumber];
    }
    if (!Array.isArray(colors)) {
      colors = [colors];
    }
    if (category && !Array.isArray(category)){
      category = [category]
    }
    if (oldImages && !Array.isArray(oldImages)){
      oldImages = [oldImages]
    }

    if (error) {
      return res.json({success: false, error: error, data: null});
    }

    const newMenuCategory = await validate.validationMenuCategoyBeforeSave(category);
    const product = {
      userId: user.objectId,
      objectId: objectId,
      information: information,
      name: name,
      price: parseInt(price),
      quantity: parseInt(quantity),
      images: images,
      fontSize: fontSize,
      sizeNumber: sizeNumber,
      colors: colors,
      categoryIds: newMenuCategory.categoryIds,
      menuIds: newMenuCategory.menuIds,
      relativeCategoryIds: newMenuCategory.relativeCategoryIds,
      description: description,
      userManual: userManual,
      shortDescription: shortDescription,
      linkInstagram: linkInstagram,
      linkFacebook: linkFacebook,
      oldImages: oldImages ? oldImages : [],
      oldPrice,
      deliveryFrom,
      deliveryTo,
    };
    const productSave = await ProductModel.update(product, sessionToken);
    return res.json({success: true, error: null, data: productSave});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
