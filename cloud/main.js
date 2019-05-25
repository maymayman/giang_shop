const menuModel = require('../models/Menu');

Parse.Cloud.beforeSave('Order', async (request) => {
  if (!request.user) {
      throw new Parse.Error(Parse.Error.LOGIN_REQUIRE, 'Login Require, Please login before complete');
  }

  if (!request.object.get('items') || !request.object.get('amount')) {
    throw new Parse.Error(Parse.Error.INVALID_DATA, 'Invalid data Order');
  }

  const deliveryInfo = request.object.get('deliveryInfo');
  if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
    throw new Parse.Error(Parse.Error.INVALID_DATA, 'Invalid data Order deliveryInfo');
  }

  if (request.object.isNew()) {
    request.object.set('user', request.user);
    request.object.set('status', 'NEW');
  } else {
    const items = request.object.get('items');
    let available = true;

    for (let id in items) {
      if (items[id].status !== 'AVAILABLE') {
        available = false;
      }
    }

    console.log(request.object.get('status'));
    if (available && request.object.get('status') === 'NEW') {
      request.object.set('status', 'AVAILABLE');
    }
  }

});

Parse.Cloud.beforeSave(Parse.User, (request) => {
  if (request.object.isNew()) {
    request.object.set('status', 'INACTIVE');
  }

  if (!request.object.get('role')) {
    request.object.set('role', 'customer');
  }
});

Parse.Cloud.beforeSave('Product', async (request) => {
  // if (!request.object.get('category')) {
  //   throw new Parse.Error(Parse.Error.INVALID_DATA, 'Invalid data Product');
  // }
  // if (!request.object.get('menuId') || request.object.get('categoryIds')) {
  //   const category = await request.object.get('category').fetchWithInclude('parent');
  //   request.object.set('menu', category.get('parent').get('menu'));
  //   request.object.set('menuId', category.get('parent').get('menu').id);
  //   request.object.set('categoryIds', [category.get('parent').id, category.id]);
  // }
  
  if(request.object.isNew()) {
    request.object.set('status', 'PENDING');
  }
});

Parse.Cloud.afterSave('Menu', async (request) => {
  menuModel.find(true, true);
});

Parse.Cloud.afterSave('Category', async (request) => {
  menuModel.find(true, true);
});
