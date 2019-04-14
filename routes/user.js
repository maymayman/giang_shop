const express = require('express');
const router = express.Router();

const cookie = require('cookie');

const MenuModel = require('../models/Menu');
const UserModel = require('../models/User');

router.get('/login', async function(req, res, next) {
  try {
    const menus = await MenuModel.find(true);
    const errorMessage = req.query.errorMessage || '';

    res.render('login_register', { menus, errorMessage });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async function(req, res, next) {
  try {
    const { username, password, email } = req.body;
    let errorMessage = ``;

    if (!username || !password || !email) {
      errorMessage = `Missing or Invalid username , password or email`
      return res.redirect(`/user/login?errorMessage=${errorMessage}`);
    }

    const result = await UserModel.signUp({ username, password, email });
    errorMessage = `Welcome ${result.username}, 
    Please verify account by your email before login`;

    return res.redirect(`/user/login?errorMessage=${errorMessage}`);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function(req, res, next) {
  try {
    let errorMessage = ``;
    const { username, password } = req.body;
    if (!username || !password) {
      errorMessage = `Missing or Invalid username or password`
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

    return res.redirect(`/`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;