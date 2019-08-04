const helper = require('./helper');

module.exports = {
	create: async function({items, amount, sessionToken, deliveryInfo, storeIds}) {
		try {
			const Order = Parse.Object.extend('Order');
			const order = new Order();

			order.set('items', items);
			order.set('amount', amount);
			order.set('deliveryInfo', deliveryInfo);
			order.set('storeIds', storeIds);

			const newOrder = await order.save(null, { sessionToken });

			return helper.toJSON(newOrder);
		} catch (err) {
			throwError(err);
		}
	},

	myOrders: async function(options) {
		try {
			const { skip, limit } = helper.pagination(options);
			const pointerToUser = new Parse.User();
			pointerToUser.id = options.user.objectId;
      
			const Order = Parse.Object.extend('Order');
			const query = new Parse.Query(Order);
			query.equalTo('user', pointerToUser);
			query.limit(limit);
			query.skip(skip);
			query.equalTo('status', options.status);
			query.descending(['createdAt']);

			const orders = await query.find();

			return helper.toJSON(orders);
		} catch (err) {
			throwError(err);
		}
	},
	countMyOrder: async function(options) {
		try {
			const pointerToUser = new Parse.User();
			pointerToUser.id = options.user.objectId;
      
			const Order = Parse.Object.extend('Order');
			const query = new Parse.Query(Order);
			query.equalTo('user', pointerToUser);
			query.equalTo('status', options.status);

			const count = await query.count();

			return count;
		} catch (err) {
			throwError(err);
		}
	},
	getOrderByAdminOrShop: async function(options) {
		try {
			const { skip, limit } = helper.pagination(options);
			const Order = Parse.Object.extend('Order');
			const query = new Parse.Query(Order);
			query.limit(limit);
			query.skip(skip);
			query.equalTo('status', options.status);
      
			if (options.user && options.user.role == 'store'){
				query.equalTo('storeIds', options.user.objectId);
			}

			const orders = await query.find();

			return helper.toJSON(orders);
		} catch (err) {
			throwError(err);
		}
	},
  
	count: async function(options) {
		try {
			const Order = Parse.Object.extend('Order');
			const query = new Parse.Query(Order);
			query.equalTo('status', options.status);
      
			if (options.user && options.user.role == 'store'){
				query.equalTo('storeIds', options.user.objectId);
			}

			const count = await query.count();

			return count;
		} catch (err) {
			throwError(err);
		}
	},

	findById: async function(objectId, user) {
		try {      
			const Order = Parse.Object.extend('Order');
			const query = new Parse.Query(Order);
			query.equalTo('objectId', objectId);
  
			if (user.role === 'store') {
				query.equalTo('storeIds', user.objectId);
			}

			const order = await query.first();

			return helper.toJSON(order);
		} catch (err) {
			throwError(err);
		}
	},

	update: async function(objectId, data, user) {
		try {      
			const Order = Parse.Object.extend('Order');
			const query = new Parse.Query(Order);

			const order = await query.get(objectId);

			order.set(data);

			const result = await order.save(null, {sessionToken: user.sessionToken});
			return result;
		} catch (err) {
			throwError(err);
		}
	}
};