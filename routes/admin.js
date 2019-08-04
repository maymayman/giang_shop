const express = require('express');
const router = express.Router();

const OrderModel = require('../models/Order');
const ContactModel = require('../models/Contact');
const BannerModel = require('../models/Banner');
const ProductModel = require('../models/Product');
const validate = require('../models/validate/validation');
const helper = require('../models/helper/index');
const _ = require('lodash');

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

router.use('/categories-parent', require('./admin/categories-parent'));

router.use('/categories-children', require('./admin/categories-children'));

router.use('/product', require('./admin/product'));

router.get('/', async function (req, res, next) {
	try {
		const user = req.user;
		res.render('../admin/index', {user});
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
				product.count = order.items[product.objectId].count;
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
    
		res.redirect('/admin/order?status=COMPLETED');
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
    
		await ContactModel.findByIdAndUpdate(objectId, user.sessionToken);
  
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
		if(!userId || user.role != 'administrator'){
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
		if(!userId || user.role != 'administrator' || !bannerId){
			const errorMessage = 'permission denied';
			return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
		}
		const options = {
			status: 'ACTIVE',
			objectId: bannerId
		};
    
		await BannerModel.findByIdAndUpdate(options, sessionToken);
    
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
  
		if(!userId || user.role != 'administrator'){
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
		if (!image && !image.length){
			let errorMessage = 'Image is require';
			return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
		}
    
		if(!userId || user.role != 'administrator'){
			let errorMessage = 'permission denied';
			return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
		}else {
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
			if(isCheck){
				let errorMessage = 'name or position is exist already';
				return res.redirect(`/admin/banner/list?errorMessage=${errorMessage}`);
			}
			await BannerModel.create(banner);
      
			res.redirect('/admin/banner/list');
		}
	} catch (error) {
		next(error);
	}
});


module.exports = router;
