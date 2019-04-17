Parse.Cloud.beforeSave('Order', async (request) => {
  if (!request.user) {
      throw new Parse.Error(Parse.Error.LOGIN_REQUIRE, 'Login Require, Please login before complete');
  }

  if (!request.object.get('items') || !request.object.get('amount')) {
    throw new Parse.Error(Parse.Error.INVALID_DATA, 'Invalid data Order');
  }

  if (request.object.isNew()) {
    request.object.set('user', request.user);
    request.object.set('status', 'NEW');
  }

  const deliveryInfo = request.object.get('deliveryInfo');
  if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
    throw new Parse.Error(Parse.Error.INVALID_DATA, 'Invalid data Order deliveryInfo');
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
  if (!request.object.get('category')) {
    throw new Parse.Error(Parse.Error.INVALID_DATA, 'Invalid data Product');
  }
  if (!request.object.get('menuId') || request.object.get('categoryIds')) {
    const category = await request.object.get('category').fetchWithInclude('parent');
    request.object.set('menuId', category.get('parent').get('menu').id);
    request.object.set('categoryIds', [category.get('parent').id, category.id]);
  }
});
