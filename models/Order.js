const helper = require('./helper');

module.exports = {
  create: async function(items, amount, sessionToken, deliveryInfo) {
    try {
      const Order = Parse.Object.extend('Order');
      const order = new Order();

      order.set('items', items);
      order.set('amount', amount);
      order.set('deliveryInfo', deliveryInfo);

      const newOrder = await order.save(null, { sessionToken });

      return helper.toJSON(newOrder);
    } catch (err) {
      throw err;
    }
  },

  myOrders: async function(userId) {
    try {
      const pointerToUser = new Parse.User();
      pointerToUser.id = userId;
      
      const Order = Parse.Object.extend('Order');
      const query = new Parse.Query(Order);
      query.equalTo('user', pointerToUser);

      const orders = await query.find();

      return helper.toJSON(orders);
    } catch (err) {
      throw err;
    }
  }
};