const express = require('express');
const router = express.Router();

const cookie = require('cookie');
const nodemailer = require('nodemailer');

const MenuModel = require('../models/Menu');
const UserModel = require('../models/User');
const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');

const common = {
  sendMail: async function(options) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        }
      });

      const info = await transporter.sendMail({
        from: process.env.MAIL_USER, // sender address
        to: options.toEmail, // list of receivers
        subject: options.subject, // Subject line
        html: options.html // html body
      });

      console.log('Message sent: %s', info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error(error, '++++++++++++++++++');
    }
  }
};

router.get('/login', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const errorMessage = req.query.errorMessage || '';

    res.render('login_register', { menus, errorMessage, user });
  } catch (error) {
    next(error);
  }
});

router.get('/logout', async function(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('X-Session-Token', '', {
    httpOnly: true,
    path: '/'
  }));

  res.redirect('/');
});

router.post('/register', async function(req, res, next) {
  try {
    const { username, password, email, store, address, phone } = req.body;
    let errorMessage = '';

    if (!username || !password || !email) {
      errorMessage = 'Missing or Invalid username , password or email';
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    }

    if (parseInt(store) && (!address || !phone)) {
      errorMessage = 'Missing Addreess';
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    }

    const data = {
      username,
      password,
      email,
      address,
      phone
    };
    const result = await UserModel.signUp(data);
    errorMessage = `Welcome ${result.username}, 
    Please verify account by your email before login`;

    const options = {
      toEmail: email,
      subject: 'Verify Email',
      html: `
      <div> 
        <p>Please verify your account</P>
        <a href=${domain}user/verify?token=${result.sessionToken}&user=${result.objectId}>
          ${domain}user/verify?token=${result.sessionToken}&user=${result.objectId}
        </a>
      `
    };

    common.sendMail(options);

    return res.redirect(`/user/login?errorMessage=${errorMessage}`);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function(req, res) {
  try {
    let errorMessage = '';
    const { username, password } = req.body;
    if (!username || !password) {
      errorMessage = 'Missing or Invalid username or password';
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    }

    const user = await UserModel.logIn(username, password);

    if (user.status === 'INACTIVE') {
      errorMessage = `Welcome ${user.username}, 
      Please verify account by your email before login`;
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    }

    res.setHeader('Set-Cookie', cookie.serialize('X-Session-Token', user.sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));

    if (user.role == 'customer') {
      return res.redirect('/');
    } else {
      return res.redirect('/admin');
    }
  } catch (error) {
    return res.redirect(`/user/login?errorMessage=${error.message}`);
  }
});

router.get('/account', async function(req, res, next) {
  try {
    const user = req.user;
    const menus = await MenuModel.find(true);
    const active = req.query.active;

    res.render('account', { menus, user, active });
  } catch (error) {
    next(error);
  }
});

router.get('/verify', async function(req, res, next) {
  try {
    const token = req.query.token;
    const userId = req.query.user;

    if (!token || !userId) {
      return res.send(`
      <a href=${domain}>
        Invalid Verify, Please try again
      </a>
      `);
    }

    const pointerToUser = new Parse.User();
    pointerToUser.id = userId;

    const user = await pointerToUser.fetch();

    const activeUser = await user.save({status: 'ACTIVE'}, { sessionToken: token });

    return res.send(`
      <a href=${domain}>
        Success Verify, Welcome ${activeUser.get('username')}, Please Login to Shopping
      </a>
    `);
  } catch (error) {
    next(error);
  }
});


router.get('/order/history', async function(req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'NEW';
    const keyword = req.query.keyword || '';

    const menus = await MenuModel.find(true);

    const orders = await OrderModel.getOrderByAdminOrShop({
      user, page, limit, status
    });

    const count = await OrderModel.count({user, status});
    res.render('./history_order', {
      menus,
      orders,
      user,
      page,
      status,
      nextPage: page + 1,
      prePage: page - 1,
      keyword,
      limit,
      totalPage: count ? Math.ceil(count/limit) : 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/order/:id', async function(req, res, next) {
  try {
    const user = req.user;
    const objectId = req.params.id;

    const menus = await MenuModel.find(true);

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

    // res.render('../admin/order/detail', {order, user, products});
    res.render('./history_order_detail', {
      menus,
      order,
      user,
      products
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
