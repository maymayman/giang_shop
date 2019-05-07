const express = require('express');
const router = express.Router();
const ProductModel = require('../models/Product');
const OrderModel = require('../models/Order');
const MenuModel = require('../models/Menu');
const ContactModel = require('../models/Contact');
const validate = require('../models/validate/validation');
const helper = require('../models/helper/index');


const checkUser = function(req, res, next){
  try {
    const user = req.user ? req.user : null;
    if (!user || (user.role != 'administrator' && user.role != 'store')){
      const errorMessage = 'permission denied';
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    }else {
      next();
    }
  }catch (error) {
    next(error);
  }
};

router.use(checkUser);

router.use('/menus', require('./admin/menu'));

router.use('/menus/create', require('./admin/menu'));

router.use('/categories-parent', require('./admin/categories-parent'));

router.use('/categories-parent/create', require('./admin/categories-parent'));

router.get('/', async function (req, res, next) {
  try {
    const user = req.user;
    res.render('../admin/index', {user});
  } catch (error) {
    next(error);
  }
});

router.get('/product', async function (req, res, next) {
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

router.get('/order', async function(req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'NEW';
    const keyword = req.query.keyword || '';
    
    const orders = await OrderModel.getOrderByAdminOrShop({
      user, page, limit, status
    });
  
    const count = await OrderModel.count({user, status});
    res.render('../admin/order/index', {
      orders,
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

router.get('/product/create', async function (req, res, next) {
  try {
    const user = req.user;
    const listCategory = await MenuModel.find(true);
    res.render('../admin/product/create', {listCategory, user});
  } catch (error) {
    next(error);
  }
});

router.get('/product/:id/approve', async function (req, res, next) {
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

router.post('/product/create/test', helper.uploadFile, async function (req, res, next) {
  console.log(req.body, req.files);
  const body = req.body;
  const images = req.files ? req.files : undefined;

  res.json({images, body});
});

router.post('/product/create', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const information = req.body.information ? req.body.information : null;
    const name = req.body.name ? req.body.name : null;
    const price = req.body.price ? req.body.price : null;
    const quantity = req.body.quantity ? req.body.quantity : 0;
    const images = req.files ? req.files : null;
    const category = req.body.category ? req.body.category : null;
    const description = req.body.description ? req.body.description : null;
    const shortDescription = req.body.shortDescription ? req.body.shortDescription : null;
    const userManual = req.body.userManual ? req.body.userManual : null;
    const linkFacebook = req.body.linkFacebook ? req.body.linkFacebook : null;
    const linkInstagram = req.body.linkInstagram ? req.body.linkInstagram : null;
    var colors = req.body.color ? req.body.color : null;
    var fontSize = req.body.fontSize ? req.body.fontSize : null;
    var sizeNumber = req.body.sizeNumber ? req.body.sizeNumber : null;
    const error = [];
    if(user && user.role != 'store'){
      return res.json('permission denied');
    }
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
    if (fontSize && !Array.isArray(fontSize)) {
      fontSize = [fontSize]
    }
    if (sizeNumber && !Array.isArray(sizeNumber)) {
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
      quantity: parseInt(quantity),
      images: images,
      fontSize: fontSize,
      sizeNumber: sizeNumber,
      colors: colors,
      category: category,
      description: description,
      userManual: userManual,
      shortDescription: shortDescription,
      linkInstagram: linkInstagram,
      linkFacebook: linkFacebook,
    };
    const productSave = await ProductModel.create(product);
    res.redirect('/admin/product?status=PENDING');
  } catch (error) {
    next(error);
  }
});
router.get('/order/:objectId', async function(req, res, next) {
  try {
    const user = req.user;
    const objectId = req.params.objectId;
    
    const order = await OrderModel.findById(objectId, user);
    
    if (!order) {
      return next('Order Not Found');
    }

    const productIds = Object.keys(order.items);
    const products = await ProductModel.findByIds(productIds, user);

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

router.get('/order/completed/:orderId', async function(req, res, next) {
  try {
   
    const user = req.user;
    const orderId = req.params.orderId;

    if (user.role !== 'administrator') {
      throw 'Permission denied';
    }
    
    const order = await OrderModel.findById(orderId, user);
    
    if (!order || order.status !== 'AVAILABLE') {
      throw 'Order Not Found';
    }

    await OrderModel.update(orderId, {status: 'COMPLETED'}, user);
    
    res.redirect(`/admin/order?status=COMPLETED`);
  } catch (error) {
    next(error);
  }
});

router.get('/order/:orderId/:productId', async function(req, res, next) {
  try {
    const user = req.user;
    const orderId = req.params.orderId;
    const productId = req.params.productId;
    const status = req.query.status;

    if (user.role !== 'store') {
      throw 'Permission denied';
    } else if (!status) {
      throw 'status Not Found';
    }
    
    const order = await OrderModel.findById(orderId, user);
    
    if (!order) {
      throw 'Order Not Found';
    }

    const items = order.items;

    if (!items[productId]) {
      throw 'product Not Found';
    }

    items[productId].status = status;

    const data = { items };
    if (status === 'OUT_OF_STOCK') {
      data.status = 'OUT_OF_STOCK';
    }

    await OrderModel.update(orderId, data, user);
    
    res.redirect(`/admin/order/${orderId}`);
  } catch (error) {
    next(error);
  }
});

router.get('/contact', async function (req, res, next) {
  try {
    const user = req.user;
    const status = req.query.status || 'PENDING';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const options = {
      page : page,
      limit : limit,
      status: status
    };
    
    const contacts = await ContactModel.findAllContact(options);
    const count = await ContactModel.count(options);
  
  
    res.render('../admin/contact', {contacts,
      user,
      status,
      page,
      nextPage: page + 1,
      prePage: page - 1,
      limit,
      totalPage: count ? Math.ceil(count/limit) : 0});
  } catch (error) {
    next(error);
  }
});

router.get('/contact/:id', async function (req, res, next) {
  try {
    const user = req.user;
    const objectId = req.params.id;
    
    const contact = await ContactModel.findByIdAndUpdate(objectId, user.sessionToken);
  
    res.redirect('/admin/contact');
  } catch (error) {
    next(error);
  }
});


module.exports = router;