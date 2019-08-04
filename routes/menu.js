const express = require('express');
const router = express.Router();

const _reduce = require('lodash/reduce');

const MenuModel = require('../models/Menu');

router.get('/categories/parent', async function(req, res, next) {
	try {
		const menuId = req.query.menu || '';
		const parentCategories = await MenuModel.findParentCategories({menuId});

		res.json(parentCategories);
	} catch (error) {
		next(error);
	}
});

router.get('/categories', async function(req, res, next) {
	try {
		const user = req.user;
		let menuId = req.query.menu;
		let parentId = req.query.parent;
		const keyword = req.query.keyword || '';
		if (!req.xhr) {
			const menus = await MenuModel.find(true);
			menuId = !menuId ? menus[0].objectId : menuId;
			parentId = !parentId ? menus[0].categories[0].objectId : parentId;
     
			res.render('designer/index', { menus, user, menuId, keyword, parentId });
		} else {
			const results = await MenuModel.findCategories({parentId, keyword});
    
			const categories = _reduce(results, function(result, item) {
				const group = item.name.trim().charAt(0).toUpperCase();
				if (!result[group]) {
					result[group] = [];
				}
				result[group].push(item);
				return result;
			}, {});

			res.render('designer/result', {categories});
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;