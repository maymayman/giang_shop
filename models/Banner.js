const helper = require('./helper');


module.exports = {
	count: async function() {
		try {
			const Banner = Parse.Object.extend('Banner');
			const query = new Parse.Query(Banner);
      
			const count = await query.count();
      
			return count;
		} catch (err) {
			throwError(err);
		}
	},
  
	findAllBanner: async function (options) {
		try {
			const Banner = Parse.Object.extend('Banner');
			const query = new Parse.Query(Banner);
      
			if(options && options.limit){
				const { skip, limit } = helper.pagination(options);
				query.skip(skip);
				query.limit(limit);
			}
      
			query.equalTo('userId', options.userId);
			query.ascending('position');
  
			const results = await query.find();
  
			return helper.toJSON(results);
		}catch (err) {
			throwError(err);
		}
    
	},
  
	findBannerIndex: async function(){
		try {
			const Banner = Parse.Object.extend('Banner');
			const query = new Parse.Query(Banner);
  
			query.equalTo('status', 'ACTIVE');
			query.ascending('position');
  
			const results = await query.find();
  
			return helper.toJSON(results);
		}catch (err) {
			throwError(err);
		}
	},
  
	create: async function (item) {
		try {
			const Banner = Parse.Object.extend('Banner');
			const banner = new Banner();
  
			banner.set('userId', item.userId);
			banner.set('title', item.title);
			banner.set('position', item.position);
			banner.set('link', item.link);
			banner.set('description', item.description);
			banner.set('image', item.image);
			banner.set('status', item.status);
			const newBanner = await banner.save();
      
			return helper.toJSON(newBanner);
		}catch (err) {
			throwError(err);
		}
	},
  
	findByIdAndUpdate: async function (options, sessionToken) {
		try {
			const Banner = Parse.Object.extend('Banner');
			const query = new Parse.Query(Banner);
			query.equalTo('objectId', options.objectId);
    
			const result = await query.first();
			result.set('status', options.status);
    
			const banner = await result.save(null, {sessionToken});
    
			return helper.toJSON(banner);
		} catch (err) {
			throwError(err);
		}
	}
  
  
};