const helper = require('./helper');

module.exports = {
  signUp: async function(data) {
    try {
      const user = new Parse.User();
      user.set(data);
      const result =  await user.signUp();

      return helper.toJSON(result);
    }  catch (err) {
      throw err;
    }
  },

  logIn: async function(username, password) {
    try {
      const user = await Parse.User.logIn(username, password);

      return helper.toJSON(user);
    }  catch (err) {
      throw err;
    }
  },
  
};