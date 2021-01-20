const helper = require('./helper');

module.exports = {
  count: async function () {
    try {
      const Ward = Parse.Object.extend('Ward');
      const query = new Parse.Query(Ward);

      const count = await query.count();

      return count;
    } catch (err) {
      throwError(err);
    }
  },

  findAllWardWithDistrictCodeAndCityCode: async function (districtCode, cityCode) {
    try {
      const Ward = Parse.Object.extend('Ward');
      const query = new Parse.Query(Ward);

      console.log("cityCode ", cityCode, "districtCode ", districtCode)
      query.equalTo('districtCode', districtCode)
      query.equalTo('cityCode', cityCode)
      query.descending('createdAt');

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throwError(err);
    }

  },

  create: async function (data) {
    try {
      const Ward = Parse.Object.extend('Ward');
      const ward = new Ward();

      ward.set('code', data.code);
      ward.set('name', data.name);
      ward.set('cityId', data.cityId || '');
      ward.set('cityCode', data.cityCode);
      ward.set('cityName', data.cityName);
      ward.set('districtId', data.districtId || '');
      ward.set('districtCode', data.districtCode);
      ward.set('districtName', data.districtName);
      ward.set('unit', data.unit);
      ward.set('fullName', data.fullName);
      ward.set('coordinate', data.coordinate || '');
      ward.set('status', 'ACTIVE');
      const newWard = await ward.save();

      return helper.toJSON(newWard);
    } catch (err) {
      throwError(err);
    }
  },

  findById: async function (objectId) {
    try {
      const Ward = Parse.Object.extend('Ward');
      const query = new Parse.Query(Ward);
      query.equalTo('objectId', objectId);

      const result = await query.first();

      return helper.toJSON(result);
    } catch (err) {
      throwError(err);
    }
  }


};