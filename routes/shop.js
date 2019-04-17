const express = require('express');
const router = express.Router();

router.get('/', async function(req, res, next) {
    try {
      res.render('../shop/index', {});
    } catch (error) {
      next(error);
    }
  });
router.get('/create', async function(req, res, next) {
    try {
      res.render('../shop/create-item', {});
    } catch (error) {
      next(error);
    }
  });
router.get('/view', async function(req, res, next) {
    try {
      res.render('../shop/list-item', {});
    } catch (error) {
      next(error);
    }
  });

module.exports = router;