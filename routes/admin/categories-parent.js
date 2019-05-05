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
    let filter = req.query.filter ? req.query.filter : '';
    let categories = [];
    let count = null;
    
    const options = {
      user: user,
      page : page,
      limit : limit,
      status: status
    };
    const menus = await MenuModel.findByAdmin(options);
  
    if(filter){
      categories = await MenuModel.findCategoriesByAdmin(options, filter);
      count = await MenuModel.countCategory(options, filter);
    }else {
      filter = menus[0].objectId;
      categories = await MenuModel.findCategoriesByAdmin(options, filter);
      count = await MenuModel.countCategory(options, filter);
    }
    
    
    res.render('../admin/menus/list-categories-parent', {
      menus,
      filter,
      categories,
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
    const objectId = req.body.objectId ? req.body.objectId : null;
    const menuId = req.body.menuId ? req.body.menuId : null;
    const status = req.body.status || 'ACTIVE';
    const name = req.body.name ? req.body.name : null;
    const position = req.body.position ? parseInt(req.body.position) : 9999;
    const options = {
      objectId : objectId,
      menuId : menuId,
      name : name,
      status: status,
      position: position,
    };
    if(user && user.role == 'administrator'){
      const isValidate = await validate.validationCategory(options, 'EDIT');
      if(isValidate){
        const category = await MenuModel.findByIdToUpdateCategory(options, sessionToken);
      }else {
        const errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
      }
    }else {
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
      menuId : menuId,
      name : name,
      status: status,
      position: position
    };
    if(user && user.role == 'administrator'){
      const isValidate = await validate.validationCategory(options, 'CREATE');
      if(isValidate){
        const category = await MenuModel.createCategory(options, sessionToken);
      }else {
        const errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
      }
    }else {
      const errorMessage = 'permission denied';
      return res.redirect(`/admin/categories-parent?errorMessage=${errorMessage}`);
    }
    
    res.redirect('/admin/categories-parent');
  } catch (error) {
    next(error);
  }
});

module.exports = router;