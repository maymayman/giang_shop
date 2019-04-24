const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');
const ContactModel = require('../models/Contact');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const products = await ProductModel.find({skip: 0, limit: 10});

    res.render('index', { menus, products, user });
  } catch (error) {
    next(error);
  } 
});

router.get('/contact', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);

    res.render('contact', { menus, user });
  } catch (error) {
    next(error);
  }
});

router.post('/contact', async function(req, res, next) {
  try {
    const user = req.user;
    const email = req.body.email ? req.body.email : null;
    const name = req.body.name ? req.body.name : null;
    const subject = req.body.subject ? req.body.subject : null;
    const message = req.body.message ? req.body.message : null;
    const menus = await MenuModel.find(true);
  
    if(email && name && message && subject){
      let dataContact = {
        email: email,
        name: name,
        subject: subject,
        message: message
      };
      const contactSave = await ContactModel.create(dataContact);
    }
    
    
    
    res.render('contact', { menus, user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
