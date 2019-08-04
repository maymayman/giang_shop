const helper = require('./helper');

module.exports = {
	count: async function() {
		try {
			const Contact = Parse.Object.extend('Contact');
			const query = new Parse.Query(Contact);
      
			const count = await query.count();
      
			return count;
		} catch (err) {
			throwError(err);
		}
	},
  
	findAllContact: async function (options) {
		try {
			const { skip, limit } = helper.pagination(options);
			const Contact = Parse.Object.extend('Contact');
			const query = new Parse.Query(Contact);
  
			query.skip(skip);
			query.limit(limit);
			query.descending('createdAt');
  
			const results = await query.find();
  
			return helper.toJSON(results);
		}catch (err) {
			throwError(err);
		}
    
	},
  
	create: async function (item) {
		try {
			const Contact = Parse.Object.extend('Contact');
			const contact = new Contact();
  
			contact.set('name', item.name);
			contact.set('email', item.email);
			contact.set('subject', item.subject);
			contact.set('message', item.message);
			contact.set('status', 'PENDING');
			const newContact = await contact.save();
      
			return helper.toJSON(newContact);
		}catch (err) {
			throwError(err);
		}
	},
  
	findByIdAndUpdate: async function (objectId, sessionToken) {
		try {
			const Contact = Parse.Object.extend('Contact');
			const query = new Parse.Query(Contact);
			query.equalTo('objectId', objectId);
    
			const result = await query.first();
			result.set('status', 'SUCCESS');
    
			const contact = await result.save(null, {sessionToken});
    
			return helper.toJSON(contact);
		} catch (err) {
			throwError(err);
		}
	}
  
  
};