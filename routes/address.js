const express = require('express');
const router = express.Router();

const _reduce = require('lodash/reduce');

const CityModel = require('../models/city');
const DistrictModel = require('../models/district');
const WardModel = require('../models/ward');

router.get('/city', async function(req, res, next) {
  try {
    console.log('vaofffffff')
    const cityId = req.query.city || '';
    let cities;
    if (!cityId) {
      cities = await CityModel.findAllCity(cityId);
    } else {
      cities = await CityModel.findById(cityId);
    }

    res.json(cities);
  } catch (error) {
    next(error);
  }
});

router.get('/district', async function(req, res, next) {
  try {
    const cityCode = req.query.city || '';
    console.log('cityCode: ', cityCode)
    const districtId = req.query.district || '';
    let districts;
    if (!districtId) {
      districts = await DistrictModel.findAllDistrictWithCityId(cityCode);
    } else {
      districts = await DistrictModel.findById(districtId);
    }

    res.json(districts);
  } catch (error) {
    next(error);
  }
});

router.get('/ward', async function(req, res, next) {
  try {
    const cityCode = req.query.city || '';
    const districtCode = req.query.district || '';
    const wardCode = req.query.ward || '';
    console.log(cityCode, districtCode)
    let wards;
    if (!wardCode) {
      wards = await WardModel.findAllWardWithDistrictCodeAndCityCode(districtCode, cityCode);
    } else {
      wards = await WardModel.findById(wardCode);
    }

    res.json(wards);
  } catch (error) {
    next(error);
  }
});

module.exports = router;