const helper = require('./helper');

module.exports = {
  count: async function() {
    try {
      const City = Parse.Object.extend('City');
      const query = new Parse.Query(City);

      const count = await query.count();

      return count;
    } catch (err) {
      throwError(err);
    }
  },

  findAllCity: async function () {
    try {
      const City = Parse.Object.extend('City');
      const query = new Parse.Query(City);

      query.descending('createdAt');

      const results = await query.find();

      return helper.toJSON(results);
    }catch (err) {
      throwError(err);
    }

  },

  create: async function (data) {
    try {
      const City = Parse.Object.extend('City');
      const city = new City();

      city.set('name', data.name);
      city.set('code', data.code);
      city.set('unit', data.unit);
      city.set('priority', data.priority || '');
      city.set('coordinate', data.coordinate || '');
      city.set('status', 'ACTIVE');
      const newCity = await city.save();

      return helper.toJSON(newCity);
    }catch (err) {
      console.log(err)
      throwError(err);
    }
  },

  findById: async function (objectId) {
    try {
      const City = Parse.Object.extend('City');
      const query = new Parse.Query(City);
      query.equalTo('objectId', objectId);

      const result = await query.first();

      return helper.toJSON(result);
    } catch (err) {
      throwError(err);
    }
  }


};