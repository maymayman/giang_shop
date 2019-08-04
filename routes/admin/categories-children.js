const express = require('express');
const router = express.Router();
const MenuModel = require('../../models/Menu');
const validate = require('../../models/validate/validation');
const helper = require('../../models/helper/index');



router.get('/', async function (req, res, next) {
	try {
		const user = req.user;
		const errorMessage = req.query.errorMessage ? req.query.errorMessage : '';
		const status = req.query.status || 'ACTIVE';
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		let parent = req.query.parent ? req.query.parent : '';
		let menu = req.query.menu ? req.query.menu : '';
		let categories = [];
		let subCategories = [];
		let count = null;
    
		const options = {
			user: user,
			status: status
		};
		const menus = await MenuModel.findByAdmin(options);
		if (!menu){
			options.menu = menus[0].objectId;
			categories = await MenuModel.findCategoriesByAdmin(options);
		}else {
			options.menu = menu;
			categories = await MenuModel.findCategoriesByAdmin(options);
		}
    
		if(parent){
			options.parent = parent;
			options.page = page;
			options.limit = limit;
			subCategories = await MenuModel.findSubCategoriesByAdmin(options);
			count = await MenuModel.countSubCategory(options);
		}else {
			parent = menus[0].objectId;
			options.parent = categories[0].objectId;
			subCategories = await MenuModel.findSubCategoriesByAdmin(options);
			count = await MenuModel.countSubCategory(options);
		}
    
		res.render('../admin/menus/list-categories-children', {
			menus,
			parent,
			menu,
			categories,
			subCategories,
			errorMessage,
			user,
			status,
			page,
			nextPage: page + 1,
			prePage: page - 1,
			limit,
			totalPage: count ? Math.ceil(count/limit) : 0
		});
	} catch (error) {
		next(error);
	}
});

router.post('/', helper.uploadFile, async function (req, res, next) {
	try {
		const user = req.user;
		const sessionToken = req.user.sessionToken;
		const objectId = req.body.objectId ? req.body.objectId : undefined;
		const menuId = req.body.menuId ? req.body.menuId : undefined;
		const parentId = req.body.parentId ? req.body.parentId : undefined;
		const status = req.body.status || 'ACTIVE';
		const name = req.body.name ? req.body.name : undefined;
		const position = req.body.position ? parseInt(req.body.position) : 9999;
		const options = {
			objectId : objectId,
			menuId : menuId,
			parentId : parentId,
			name : name,
			status: status,
			position: position,
		};
		if(user && user.role == 'administrator'){
			const isValidate = await validate.validationSubCategory(options, 'EDIT');
			if(isValidate){
				await MenuModel.findByIdToUpdateCategory(options, sessionToken);
			}else {
				const errorMessage = 'name or position is exist already';
				return res.redirect(`/admin/categories-children?errorMessage=${errorMessage}`);
			}
		}else {
			const errorMessage = 'permission denied';
			return res.redirect(`/admin/categories-children?errorMessage=${errorMessage}`);
		}
    
		res.redirect('/admin/categories-children');
	} catch (error) {
		next(error);
	}
});

router.post('/create', helper.uploadFile, async function (req, res, next) {
	try {
		const user = req.user;
		const sessionToken = req.user.sessionToken;
		const status = req.body.newStatus || 'ACTIVE';
		const name = req.body.newName ? req.body.newName : undefined;
		const menuId = req.body.newMenuId ? req.body.newMenuId : undefined;
		const parentId = req.body.newParentId ? req.body.newParentId : undefined;
		const position = req.body.newPosition ? parseInt(req.body.newPosition) : 9999;
		const options = {
			menuId : menuId,
			parentId : parentId,
			name : name,
			status: status,
			position: position
		};
		if(user && user.role == 'administrator'){
			const isValidate = await validate.validationSubCategory(options, 'CREATE');
			if(isValidate){
				await MenuModel.createSubCategory(options, sessionToken);
			}else {
				const errorMessage = 'name or position is exist already';
				return res.redirect(`/admin/categories-children?errorMessage=${errorMessage}`);
			}
		}else {
			const errorMessage = 'permission denied';
			return res.redirect(`/admin/categories-children?errorMessage=${errorMessage}`);
		}
    
		res.redirect('/admin/categories-children');
	} catch (error) {
		next(error);
	}
});

module.exports = router;