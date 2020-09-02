const HELP = require('./helps') 
const Product = Parse.Object.extend('Product');
const CityModel = require('../models/city')
const DistrictModel = require('../models/district')
const WardModel = require('../models/ward')

module.exports = {
  renderThumbnails: async () => {
    try {
      const query = new Parse.Query(Product);
      query.doesNotExist('thumbnails')
           .equalTo('status', 'ACTIVE')
           .limit(1000);
  
      const products = await query.find();
  
      return await HELP.resizeImages(products);
    } catch (error) {
      console.error(`${new Date()} [JOBS] renderThumbnails: ${error.stack}`);
    }
  },
  addCities: async () => {
    try {
      let promise = []
      if (cities && cities.length) {
        for (let city of cities) {
          // let cityFound = await CityModel.findById(city.)
          promise.push(CityModel.create(city));
        }
      }
      await Promise.all(promise)
      console.log(`add ${cities.length} cities done!!!`);
      return
    } catch (e) {
      console.log('err: ', e)
      return e
    }
  },
  addDistrict: async () => {
    try {
      let promise = []
      if (districts && districts.length) {
        for (let district of districts) {
          promise.push(DistrictModel.create(district))
        }
      }
      await Promise.all(promise)
      console.log(`add ${districts.length} districts done!!!`);
      return
    } catch (e) {
      console.log('err: ', e)
      return e
    }
  },
  addWard: async () => {
    try {
      let promise = []
      console.log('ward: ', wards.length)
      if (wards && wards.length) {
        for (let ward of wards) {
          promise.push(WardModel.create(ward))
        }
      }
      await Promise.all(promise)
      console.log(`add ${wards.length} wards done!!!`);
      return
    } catch (e) {
      console.log('err: ', e)
      return e
    }
  }
};