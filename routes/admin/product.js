const express = require('express');
const router = express.Router();

const Joi = require('joi');

const helper = require('../../models/helper/index');
const ProductModel = require('../../models/Product');
const MenuModel = require('../../models/Menu');
const validate = require('../../models/validate/validation');

const validateSaveProd = function(body) {
  let sizes = [];
  if (body.size === 'numberSize') {
    sizes = [
      '35', '35,5', '36', '36,5', '37', '37,5', '38', '38,5', '39', '39,5', 
      '40', '40,5', '41', '41,5', '42', '42,5', '43', '43,5', '44'
    ];
  } else if (body.size === 'fontSize') {
    sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  }

  if (body.colors === 'none') {
    body.colors = body.descriptionColor;
  }

  delete body.descriptionColor;

  const sizeSchema = {};
  sizes.forEach(function(size) {
    sizeSchema[size] = Joi.number().min(0).required();
  });
  
  const schema = Joi.object().keys({
    type: Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    information: Joi.string().required(),
    code: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().min(1000).required(),
    oldPrice: Joi.number().min(1000).required(),
    deliveryFrom: Joi.number().min(1).required(),
    deliveryTo: Joi.number().min(1).required(),
    category: Joi.alternatives().try(
      Joi.string(), 
      Joi.array().items(Joi.string())
    ).required(),
    description: Joi.string().required(),
    shortDescription: Joi.string().required(),
    userManual: Joi.string().required(),
    linkFacebook: Joi.string().optional().allow(''),
    linkInstagram: Joi.string().optional().allow(''),
    colors: Joi.alternatives().try(
      Joi.string(), 
      Joi.array().items(Joi.string())
    ).required(),
    size: Joi.string().required().valid('numberSize', 'fontSize'),
    ...sizeSchema,
  });
  
  const { error } = schema.validate(body);

  if (error) throw new Error(error.details[0].message);

  if (!Array.isArray(body.category)) {
    body.category = [body.category];
  }

  if (!Array.isArray(body.colors)) {
    body.colors = [body.colors];
  }
  body.price = parseInt(body.price, 10);
  body.oldPrice = parseInt(body.oldPrice, 10);
  body.deliveryFrom = parseInt(body.deliveryFrom, 10);
  body.deliveryTo = parseInt(body.deliveryTo, 10);
  body.code = body.code.trim();

  const quantitySize = {};
  let quantity = 0;

  sizes.forEach(function(size) {
    quantitySize[size] = parseInt(body[size]);
    quantity += parseInt(body[size], 10);
    delete body[size];
  });

  body.quantitySize = quantitySize;
  body.quantity = quantity;
  
  return body;
};

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
      await ProductModel.findByObjectIdToUpdate(productId, 'ACTIVE', user.sessionToken);
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
      await ProductModel.findByObjectIdToUpdate(productId, 'DELETED', user.sessionToken);
      res.redirect('/admin/product?status=PENDING');
    }else {
      res.json('Some thing was wrong');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/create', helper.uploadFile, async function (req, res) {
  try {
    req.body.images = req.files ? req.files :  null;
    const data = validateSaveProd(req.body);
    const newMenuCategory = validate.validationMenuCategoyBeforeSave(data.category);
    data.relativeCategoryIds = newMenuCategory.relativeCategoryIds;
    data.categoryIds = newMenuCategory.categoryIds;
    data.menuIds = newMenuCategory.menuIds;
    delete data.category;
    const productSave = await ProductModel.create(data, req.user);
    return res.json({success: true, error: null, data: productSave});
  } catch (error) {
    return res.json({success: false, error: error.message, data: null});
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

router.post('/update/:id', helper.uploadFile, async function (req, res) {
  try {
    const objectId = req.params.id;
    let oldImages = req.body.oldImages 
      ? Array.isArray(req.body.oldImages) ? req.body.oldImages : [req.body.oldImages]
      : [];
    let images = req.files ? req.files :  [];

    images = oldImages.concat(images);
    req.body.images = images;
    delete req.body.oldImages;
    const data = validateSaveProd(req.body);
    const newMenuCategory = validate.validationMenuCategoyBeforeSave(data.category);
    data.relativeCategoryIds = newMenuCategory.relativeCategoryIds;
    data.categoryIds = newMenuCategory.categoryIds;
    data.menuIds = newMenuCategory.menuIds;
    delete data.category;
    
    const productSave = await ProductModel.update(objectId, data, req.user);
    return res.json({success: true, error: null, data: productSave});
  } catch (error) {
    return res.json({success: false, error: error.message, data: null});
  }
});

module.exports = router;
