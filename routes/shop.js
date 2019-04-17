const express = require('express');
const router = express.Router();

router.get('/', async function(req, res, next) {
    try {
      res.render('../shop/index', {});
    } catch (error) {
      next(error);
    }
  });

module.exports = router;