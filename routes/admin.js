const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const util = require('util');
const fs = require('fs');
const public = process.env.PUBLIC_FOLDER || '/public';
const uploadDir = `.${public}/media`;
const numberSlice = public.length;
const ProductModel = require('../models/Product');
const OrderModel = require('../models/Order');
const MenuModel = require('../models/Menu');

const uploadFile = function (req, res, next) {
  const form = new formidable.IncomingForm();
  const removeFile = [];
  const files = [];
  req.body = {};
  form.uploadDir = uploadDir;
  
  form.parse(req)
    .on('field', function (field, value) {
      if (req.body[field]) {
        if (!Array.isArray(req.body[field])) {
          const tmp = req.body[field];
          req.body[field] = [tmp];
        }
        req.body[field].push(value);
      } else {
        req.body[field] = value;
      }
    })
    .on('file', function (field, file) {
      if (file && file.type == 'application/octet-stream') {
        removeFile.push(file.path);
      }
      if (file && file.type != 'application/octet-stream') {
        const type = file.type.split('/')[1];
        const newPath = file.path + "." + type;
        fs.renameSync(file.path, newPath);
        const link = newPath.slice(numberSlice);
        files.push(link);
      }
    })
    .on('end', function () {
      if (removeFile && removeFile.length > 0){
        for (let i = 0; i < removeFile.length; i++){
          fs.unlinkSync(removeFile[i]);
        }
      }
      req.files = files;
      next();
    });
};

router.get('/', async function (req, res, next) {
  try {
    res.render('../admin/index', {});
  } catch (error) {
    next(error);
  }
});

router.get('/product', async function (req, res, next) {
  try {
    const user = req.user;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'ACTIVE';
    const products = await ProductModel.find({skip, limit, user, status});
    
    res.render('../admin/product/index', {products, user});
  } catch (error) {
    next(error);
  }
});

router.get('/order', async function(req, res, next) {
  try {
    const user = req.user;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    
    const orders = await OrderModel.getOrderByAdminOrShop({
      user, skip, limit, status
    });
    res.render('../admin/order/index', {orders, user});
  } catch (error) {
    next(error);
  }
});

router.get('/product/create', async function (req, res, next) {
  try {
    const listCategory = await MenuModel.find(true);
    console.log('listCategory: ', listCategory);
    res.render('../admin/create-item', {listCategory});
  } catch (error) {
    next(error);
  }
});

router.post('/product/create', uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const information = req.body.information ? req.body.information : null;
    const name = req.body.name ? req.body.name : null;
    const price = req.body.price ? req.body.price : null;
    const images = req.files ? req.files : null;
    var colors = req.body.color ? req.body.color : null;
    const category = req.body.category ? req.body.category : null;
    var fontSize = req.body.fontSize ? req.body.fontSize : null;
    var sizeNumber = req.body.sizeNumber ? req.body.sizeNumber : null;
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
    if (!category) {
      error.push('category is require.')
    }
    if (!Array.isArray(fontSize)) {
      fontSize = [fontSize]
    }
    if (!Array.isArray(sizeNumber)) {
      sizeNumber = [sizeNumber]
    }
    if (!Array.isArray(colors)) {
      colors = [colors]
    }
    if (error && error.length > 0) {
      return res.json({success: false, error: error, data: null});
    }
    const product = {
      userId: user.objectId,
      information: information,
      name: name,
      price: parseInt(price),
      images: images,
      fontSize: fontSize,
      sizeNumber: sizeNumber,
      colors: colors,
      category: category,
    };
    const productSave = await ProductModel.create(product);
    // return res.json({success: true, error: null, data: productSave});
    res.redirect('/admin/product?status=PENDING');
  } catch (error) {
    next(error);
  }
});
router.get('/order/:objectId', async function(req, res, next) {
  try {
    const user = req.user;
    const objectId = req.params.objectId;
    
    const order = await OrderModel.findById(objectId);
    
    if (!order) {
      return next('Order Not Found');
    }

    const productIds = Object.keys(order.items);
    const products = await ProductModel.findByIds(productIds);

    if (products.length) {
      products.forEach(product => {
        product.count = order.items[product.objectId].count
      });
    }

    res.render('../admin/order/detail', {order, user, products});
  } catch (error) {
    next(error);
  }
});

module.exports = router;