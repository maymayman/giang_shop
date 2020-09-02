const helper = require('./helper');

module.exports = {
  count: async function() {
    try {
      const District = Parse.Object.extend('District');
      const query = new Parse.Query(District);

      const count = await query.count();

      return count;
    } catch (err) {
      throwError(err);
    }
  },

  findAllDistrictWithCityId: async function (cityCode) {
    try {
      const District = Parse.Object.extend('District');
      const query = new Parse.Query(District);

      query.equalTo('cityCode', cityCode)
      query.descending('name');

      const results = await query.find();

      return helper.toJSON(results);
    }catch (err) {
      throwError(err);
    }

  },

  create: async function (data) {
    try {
      const District = Parse.Object.extend('District');
      const district = new District();

      district.set('name', data.name);
      district.set('code', data.code);
      district.set('cityId', data.cityId || '');
      district.set('cityCode', data.cityCode);
      district.set('unit', data.unit);
      district.set('provinceName', data.provinceName);
      district.set('fullName', data.fullName);
      district.set('coordinate', data.coordinate || '');
      district.set('status', 'ACTIVE');
      const newDistrict = await district.save();

      return helper.toJSON(newDistrict);
    }catch (err) {
      throwError(err);
    }
  },

  findById: async function (cityCode) {
    try {
      const District = Parse.Object.extend('District');
      const query = new Parse.Query(District);
      query.equalTo('cityCode', cityCode);

      const result = await query.first();

      return helper.toJSON(result);
    } catch (err) {
      throwError(err);
    }
  }


};