const helper = require('./helper');


module.exports = {
  
  find: async function (item) {
  
  },
  
  create: async function (item) {
    try {
      const Contact = Parse.Object.extend('Contact');
      const contact = new Contact();
  
      contact.set('name', item.name);
      contact.set('email', item.email);
      contact.set('subject', item.subject);
      contact.set('message', item.message);
      const newContact = await contact.save();
      
      return helper.toJSON(newContact);
    }catch (err) {
      throw err;
    }
    
  }
  
  
};