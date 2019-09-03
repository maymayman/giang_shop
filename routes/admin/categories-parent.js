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
    let menu = req.query.menu ? req.query.menu : '';
    let categories = [];
    let count = null;

    const options = {
      user: user,
      status: status,
    };
    const menus = await MenuModel.findByAdmin(options);

    if (menu) {
      options.menu = menu;
    }

    options.page = page;
    options.limit = limit;
    categories = await MenuModel.findCategoriesByAdmin(options);
    count = await MenuModel.countCategory(options);

    res.render('../admin/menus/list-categories-parent', {
      menus,
      menu,
      categories,
      errorMessage,
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

router.post('/', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const sessionToken = req.user.sessionToken;
    const objectId = req.body.objectId ? req.body.objectId : null;
    const menuId = req.body.menuId ? req.body.menuId : null;
    const status = req.body.status || 'ACTIVE';
    const name = req.body.name ? req.body.name : null;
    const position = req.body.position ? parseInt(req.body.position) : 9999;
    const options = {
      objectId: objectId,
      menuId: menuId,
      name: name,
      status: status,
      position: position,
    };
    if (user && user.role == 'administrator') {
      const isValidate = await validate.validationCategory(options, 'EDIT');
      if (isValidate) {
        await MenuModel.findByIdToUpdateCategory(options, sessionToken);
      } else {
        const errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
      }
    } else {
      const errorMessage = 'permission denied';
      return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
    }

    res.redirect('/admin/categories-parent');
  } catch (error) {
    next(error);
  }
});

router.post('/create', helper.uploadFile, async function (req, res, next) {
  try {
    const user = req.user;
    const sessionToken = req.user.sessionToken;
    const status = req.body.newStatus || 'ACTIVE';
    const name = req.body.newName ? req.body.newName : null;
    const menuId = req.body.newMenuId ? req.body.newMenuId : null;
    const position = req.body.newPosition ? parseInt(req.body.newPosition) : 9999;
    const options = {
      menuId: menuId,
      name: name,
      status: status,
      position: position
    };
    if (user && user.role == 'administrator') {
      const isValidate = await validate.validationCategory(options, 'CREATE');
      if (isValidate) {
        await MenuModel.createCategory(options, sessionToken);
      } else {
        const errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
      }
    } else {
      const errorMessage = 'permission denied';
      return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
    }

    res.redirect('/admin/categories-parent');
  } catch (error) {
    next(error);
  }
});

router.get('/list', async function (req, res, next) {
  try {
    let menuId = req.query.menu ? req.query.menu : '';
    const options = {
      menuId: menuId
    };
    const categories = await MenuModel.findParentCategories(options);
    res.json({categories: categories});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
