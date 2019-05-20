const express = require('express');
const router = express.Router();

const url = require('url');
const MenuModel = require('../models/Menu');
const ProductModel = require('../models/Product');
const ContactModel = require('../models/Contact');
const BannerModel = require('../models/Banner');

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const products = await ProductModel.find({skip: 0, limit: 10});
    let banners = await BannerModel.findBannerIndex();
    if (banners && banners.length){
      banners.forEach(banner => {
        banner.image = url.parse(banner.image).href;
      });
    }
    res.render('index', {menus, products, user, banners});
  } catch (error) {
    next(error);
  }
});

router.get('/contact', async function (req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const messageToUser = req.query.messageToUser || '';
    
    res.render('contact', {menus, user, messageToUser});
  } catch (error) {
    next(error);
  }
});

router.post('/contact', async function (req, res, next) {
  try {
    const email = req.body.email ? req.body.email : null;
    const name = req.body.name ? req.body.name : null;
    const subject = req.body.subject ? req.body.subject : null;
    const message = req.body.message ? req.body.message : null;
    let messageToUser = null;
    
    if (email && name && message && subject) {
      let dataContact = {
        email: email,
        name: name,
        subject: subject,
        message: message
      };
      const contactSave = await ContactModel.create(dataContact);
      if (contactSave && contactSave.objectId) {
        messageToUser = 'Your contact send success'
      } else {
        messageToUser = 'Some thing was wrong!'
      }
    } else {
      messageToUser = 'Please add full contact'
    }
    
    res.redirect(`/contact?messageToUser=${messageToUser}`);
  } catch (error) {
    next(error);
  }
});

router.get('/designers', async function (req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    res.render('designer', {menus, user});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
