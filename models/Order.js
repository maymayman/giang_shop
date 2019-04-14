const helper = require('./helper');

module.exports = {
  create: async function(items, amount, sessionToken) {
    try {
      const Order = Parse.Object.extend('Order');
      const order = new Order();

      order.set('items', items);
      order.set('amount', amount);

      const newOrder = await order.save(null, { sessionToken });

      return helper.toJSON(newOrder);
    } catch (err) {
      throw err;
    }
  }
};