const express = require('express');
const router = express.Router();

const MenuModel = require('../models/Menu');
const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');

const checkProdAvailable = async (products) => {
  try {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const type = product.type;

      if (type === 'available') {
        const objectId = product.objectId;
        const size = product.size;
        const count = product.count;

        const available = await ProductModel.available(objectId, size, count);

        if (!available) throw new Error(`${product.name} : out of stock `);
      }
    }
  } catch (err) {
    throwError(err);
  }
};

const caculateTotalAmount = function(order) {
  const products = Object.values(order);
  return products.reduce(( accumulator, product ) => {
    return accumulator + product.price * product.count;
  }, 0);
};

const formatOrders = function(data, sessionToken, deliveryInfo) {
  const orders = Object.values(data);

  return orders.reduce((results, order) => {
    const data = [{ 
      items: order,
      amount: caculateTotalAmount(order),
      sessionToken, 
      deliveryInfo, 
      storeIds: [Object.values(order)[0].storeId],
      type: Object.values(order)[0].type
    }];

    return [
      ...results,
      ...data
    ];
  }, []);
};

router.get('/', async function(req, res, next) {
  try {
    
    const user = req.user;
    const cookies = req.cookies;
    const cartProducts = cookies.cartProducts ? JSON.parse(cookies.cartProducts) : undefined;
    const products = cartProducts ? Object.values(cartProducts) : [];
    const menus = await MenuModel.find(true);
    
    let totalAmount = 0;

    products.forEach(product => {
      totalAmount = totalAmount + product.price * product.count;
    });

    res.render('cart', { menus, products, totalAmount, user });
  } catch (error) {
    next(error);
  }
});

router.post('/order', async function(req, res) {
  try {
    const cookies = req.cookies;
    const cartProducts = cookies.cartProducts ? JSON.parse(cookies.cartProducts) : undefined;
    const products = cartProducts ? Object.values(cartProducts) : [];
    const sessionToken = cookies['X-Session-Token'] || '';
    const deliveryInfo = req.body.deliveryInfo;
    const storeIds = [];
    const orders = {};

    if (!storeIds || !deliveryInfo){
      return res.json({success: false, error: 'Invalid data ', data: null});
    }

    await checkProdAvailable(products);

    products.forEach(product => {
      const orderCode = product.storeId + '-' + product.type;
      if (!orders[orderCode]) {
        orders[orderCode] = {};
        orders[orderCode][product.objectId] = product;
      } else {
        if (!orders[orderCode][product.objectId]) {
          orders[orderCode][product.objectId] = product;
        }
      }
    });

    const promises = [];

    const orderList = formatOrders(orders, sessionToken, deliveryInfo);
    
    orderList.forEach((data) => {
      promises.push(OrderModel.create(data));
    });
    
    const result = await Promise.all(promises);

    res.json({success: true, error: null, data: { orders: result } });
  } catch (error) {
    res.json({success: false, error: error.message, data: null});
  }
});

module.exports = router;