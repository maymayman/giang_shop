const helper = require('./helper');

const Help = {

};

module.exports = {
  find: async function(options) {
    try {
      const { skip, limit } = helper.pagination(options);
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      query.equalTo('status', "ACTIVE");
      query.skip(skip);
      query.limit(limit);

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throw err;
    }
  },

  findByObjectId: async function(objectId) {
    try {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      query.equalTo('status', "ACTIVE");
      query.equalTo('objectId', objectId);

      const result = await query.first();

      return helper.toJSON(result);
    } catch (err) {
      throw err;
    }
  }
}