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
    const options = {
      user: user,
      page : page,
      limit : limit,
      status: status
    };
    
    const menus = await MenuModel.findByAdmin(options);
    const count = await MenuModel.count(options);
    
    res.render('../admin/menus/list-menus', {
      menus,
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
    const status = req.body.status || 'ACTIVE';
    const name = req.body.name ? req.body.name : null;
    const position = req.body.position ? parseInt(req.body.position) : 9999;
    const options = {
      objectId : objectId,
      name : name,
      status: status,
      position: position
    };
    if(user && user.role == 'administrator'){
      const isValidate = await validate.validationMenu(options, 'EDIT');
      if(isValidate){
        await MenuModel.findByIdToUpdate(options, sessionToken);
      }else {
        const errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/menus?errorMessage=${errorMessage}`);
      }
    }else {
      const errorMessage = 'permission denied';
      return res.redirect(`/admin/menus?errorMessage=${errorMessage}`);
    }
    
    res.redirect('/admin/menus');
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
    const position = req.body.newPosition ? parseInt(req.body.newPosition) : 9999;
    const options = {
      name : name,
      status: status,
      position: position
    };
    if(user && user.role == 'administrator'){
      const isValidate = await validate.validationMenu(options, 'CREATE');
      if(isValidate){
        await MenuModel.create(options, sessionToken);
      }else {
        const errorMessage = 'name or position is exist already';
        return res.redirect(`/admin/menus?errorMessage=${errorMessage}`);
      }
    }else {
      const errorMessage = 'permission denied';
      return res.redirect(`/admin/menus?errorMessage=${errorMessage}`);
    }
    
    res.redirect('/admin/menus');
  } catch (error) {
    next(error);
  }
});

module.exports = router;