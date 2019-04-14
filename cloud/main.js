Parse.Cloud.beforeSave('Order', (request) => {
  if (!request.user) {
      throw new Parse.Error(Parse.Error.LOGIN_REQUIRE, 'Login Require, Please login before complete');
  }

  request.object.set('user', request.user);
});

Parse.Cloud.beforeSave(Parse.User, (request) => {
  if (request.object.isNew()) {
    request.object.set('status', 'INACTIVE');
  }  
});