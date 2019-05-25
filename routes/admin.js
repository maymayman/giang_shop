const express = require('express');
const router = express.Router();
const ProductModel = require('../models/Product');
const OrderModel = require('../models/Order');
const MenuModel = require('../models/Menu');
const ContactModel = require('../models/Contact');
const BannerModel = require('../models/Banner');
const validate = require('../models/validate/validation');
const helper = require('../models/helper/index');
const _ = require('lodash');

const checkUser = function (req, res, next) {
  try {
    const user = req.user ? req.user : null;
    if (!user || (user.role != 'administrator' && user.role != 'store')) {
      const errorMessage = 'permission denied';
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

router.use(checkUser);

router.use('/menus', require('./admin/menu'));

router.use('/menus/create', require('./admin/menu'));


router.use('/categories-parent', require('./admin/categories-parent'));

router.use('/categories-parent/list', require('./admin/categories-parent'));

router.use('/categories-parent/create', require('./admin/categories-parent'));

router.use('/categories-children', require('./admin/categories-children'));

router.use('/categories-children/create', require('./admin/categories-children'));


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
    
    res.render('../admin/product/index', {
      products,
      user,
      page,
      nextPage: page + 1,
      prePage: page - 1,
      keyword,
      status,
      limit,
      totalPage: count ? Math.ceil(count / limit) : 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/order', async function (req, res, next) {
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
      totalPage: count ? Math.ceil(count / limit) : 0
    });
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
    
    if (productId && user) {
      const product = await ProductModel.findByObjectIdToUpdate(productId, 'ACTIVE', user.sessionToken);
      res.redirect('/admin/product?status=ACTIVE');
    } else {
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
    let colors = req.body.color ? req.body.color : null;
    let fontSize = req.body.fontSize ? req.body.fontSize : null;
    let sizeNumber = req.body.sizeNumber ? req.body.sizeNumber : null;
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
    if (!images) {
      error = 'images is require.';
    }
    if (!category) {
      error = 'category is require.';
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
    return res.json({success: true, error: null, data: productSave});
  } catch (error) {
    next(error);
  }
});

router.get('/product/:id/update', async function (req, res, next) {
  try {
    const user = req.user;
    const productId = req.params.id ? req.params.id : null;
    
    if (productId && user) {
      const product = await ProductModel.findByObjectId(productId, user);
      const listCategory = await MenuModel.find(true);
      
      res.render('../admin/product/update', {product, user, listCategory});
    } else {
      res.json('Some thing was wrong');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/product/:id/update', async function (req, res, next) {
  try {
    const user = req.user;
    const sessionToken = req.user.sessionToken;
    const information = req.body.information ? req.body.information : undefined;
    const name = req.body.name ? req.body.name : undefined;
    const price = req.body.price ? req.body.price : undefined;
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
    if (!images) {
      error = 'images is require.';
    }
    if (!category) {
      error = 'category is require.';
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
    if (error) {
      return res.json({success: false, error: error, data: null});
    }
    const newMenuCategory  = await validate.validationMenuCategoyBeforeSave(category);
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
      description: description,
      userManual: userManual,
      shortDescription: shortDescription,
      linkInstagram: linkInstagram,
      linkFacebook: linkFacebook,
    };
    const productSave = await ProductModel.update(product, sessionToken);
    return res.json({success: true, error: null, data: productSave});
  } catch (error) {
    next(error);
  }
});

router.get('/order/:objectId', async function (req, res, next) {
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

router.get('/order/completed/:orderId', async function (req, res, next) {
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

router.get('/order/:orderId/:productId', async function (req, res, next) {
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
    
    const data = {items};
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
      page: page,
      limit: limit,
      status: status
    };
    
    const contacts = await ContactModel.findAllContact(options);
    const count = await ContactModel.count(options);
    
    
    res.render('../admin/contact', {
      contacts,
      user,
      status,
      page,
      nextPage: page + 1,
      prePage: page - 1,
      limit,
      totalPage: count ? Math.ceil(count / limit) : 0
    });
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


router.get('/banner/list', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    let errorMessage = req.query.errorMessage ? req.query.errorMessage : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const userId = _.get(user, 'objectId', undefined);
    const options = {
      page: page,
      limit: limit,
      userId: userId
    };
    if (!userId || user.role != 'administrator') {
      errorMessage = 'permission denied';
      return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
    }
    const listBanner = await BannerModel.findAllBanner(options);
    
    res.render('../admin/banner/list-banner', {user, listBanner, errorMessage});
  } catch (error) {
    next(error);
  }
});

router.get('/banner/list/:bannerId', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const sessionToken = req.user.sessionToken;
    const bannerId = req.params.bannerId;
    const userId = _.get(user, 'objectId', undefined);
    if (!userId || user.role != 'administrator' || !bannerId) {
      const errorMessage = 'permission denied';
      return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
    }
    const options = {
      status: 'ACTIVE',
      objectId: bannerId
    };
    
    const bannerSaved = await BannerModel.findByIdAndUpdate(options, sessionToken);
    
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/banner/create', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    let errorMessage = req.query.errorMessage ? req.query.errorMessage : '';
    const userId = _.get(user, 'objectId', undefined);
    
    if (!userId || user.role != 'administrator') {
      errorMessage = 'permission denied';
      return res.redirect(`/admin/banner/create?errorMessage=${errorMessage}`);
    }
    res.render('../admin/banner/create-banner', {user, errorMessage});
  } catch (error) {
    next(error);
  }
});

router.post('/banner/create', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const userId = _.get(user, 'objectId', undefined);
    const title = req.body.title ? req.body.title : undefined;
    const link = req.body.link ? req.body.link : undefined;
    const position = req.body.position ? req.body.position : undefined;
    const description = req.body.description ? req.body.description : undefined;
    const status = req.body.status ? req.body.status : 'ACTIVE';
    const image = req.files ? req.files : undefined;
    if (!image && !image.length) {
      let errorMessage = 'Image is require';
      return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
    }
    
    if (!userId || user.role != 'administrator') {
      let errorMessage = 'permission denied';
      return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
    } else {
      const banner = {
        userId: userId,
        title: title,
        position: position,
        link: link,
        status: status,
        image: image[0],
        description: description,
      };
      const isCheck = await validate.validationBanner(banner);
      if (isCheck) {
        let errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
      }
      const bannerSave = await BannerModel.create(banner);
      
      res.redirect('/admin/banner/list');
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;