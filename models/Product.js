const helper = require('./helper');

const Help = {

};

module.exports = {
  find: async function(options) {
    try {
      const { skip, limit } = helper.pagination(options);
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);

      if (!options.user || options.user.role === 'customer') {
        query.equalTo('status', "ACTIVE");
      } else {
        if (options.status) {
          query.equalTo('status', options.status);
        }

        if (options.user.role === 'store') {
          const pointerToStore = new Parse.User();
          pointerToStore.id = options.user.objectId;

          query.equalTo('store', pointerToStore);
        }
      }
      
      if (options.menuId) {
        query.equalTo('menuId', options.menuId);
      }

      if (options.categoryId) {
        query.equalTo('categoryIds', options.categoryId);
      }

      if (options.keyword) {
        query.matches('name', new RegExp(options.keyword, 'i'));
      }

      query.skip(skip);
      query.limit(limit);
      query.descending('createdAt');

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throw err;
    }
  },

  count: async function(options) {
    try {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);

      if (!options.user || options.user.role === 'customer') {
        query.equalTo('status', "ACTIVE");
      } else {
        if (options.status) {
          query.equalTo('status', options.status);
        }

        if (options.user.role === 'store') {
          const pointerToStore = new Parse.User();
          pointerToStore.id = options.user.objectId;
          query.equalTo('store', pointerToStore);
        }
      }
      
      if (options.menuId) {
        query.equalTo('menuId', options.menuId);
      }

      if (options.categoryId) {
        query.equalTo('categoryIds', options.categoryId);
      }

      if (options.keyword) {
        query.matches('name', new RegExp(options.keyword, 'i'));
      }

      const count = await query.count();

      return count;
    } catch (err) {
      throw err;
    }
  },

  findByObjectId: async function(objectId, user) {
    try {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      if (!user || user.role == 'customer') {
        query.equalTo('status', "ACTIVE");
  
      }
      query.equalTo('objectId', objectId);

      const result = await query.first();

      return helper.toJSON(result);
    } catch (err) {
      throw err;
    }
  },
  
  findByObjectIdToUpdate: async function(objectId, status, sessionToken) {
    try {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      query.equalTo('objectId', objectId);

      const result = await query.first();
      result.set('status', status);
      
      const product = await result.save(null, {sessionToken});

      return helper.toJSON(product);
    } catch (err) {
      throw err;
    }
  },
  
  create: async function(item) {
    try {
      const Product = Parse.Object.extend('Product');
      const product = new Product();
  
      const Category = Parse.Object.extend('Category');
      const pointerToCategory = new Category();
      pointerToCategory.id = item.category;
  
      const pointerToStore = new Parse.User();
      pointerToStore.id = item.userId;
      
      product.set('store', pointerToStore);
      product.set('information', (item.information ? item.information : ''));
      product.set('name', item.name);
      product.set('price', item.price);
      product.set('quantity', item.quantity);
      product.set('images', item.images);
      product.set('category', pointerToCategory);
      product.set('colors', item.colors);
      product.set('description', item.description);
      product.set('userManual', item.userManual);
      product.set('shortDescription', item.shortDescription);
      product.set('linkFacebook', item.linkFacebook);
      product.set('linkInstagram', item.linkInstagram);
      if (item.fontSize && item.fontSize.length > 0) {
        product.set('size', item.fontSize);
      }else {
        product.set('size', item.sizeNumber);
      }
      const newProduct = await product.save();
  
      return helper.toJSON(newProduct);
    }  catch (err) {
      throw err;
    }
  },
  
  update: async function(item) {
    try {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      query.equalTo('objectId', item.objectId);
  
      const result = await query.first();
      
      result.set('information', (item.information ? item.information : ''));
      result.set('name', item.name);
      result.set('price', item.price);
      result.set('quantity', item.quantity);
      result.set('images', item.images);
      result.set('categoryIds', item.categoryIds);
      result.set('menuIds', item.menuIds);
      result.set('colors', item.colors);
      result.set('description', item.description);
      result.set('userManual', item.userManual);
      result.set('shortDescription', item.shortDescription);
      result.set('linkFacebook', item.linkFacebook);
      result.set('linkInstagram', item.linkInstagram);
      if (item.fontSize && item.fontSize.length > 0) {
        result.set('size', item.fontSize);
      }else {
        result.set('size', item.sizeNumber);
      }
      const productUpdated = await result.save();
  
      return helper.toJSON(productUpdated);
    }  catch (err) {
      throw err;
    }
  },
  
  findByIds: async function(objectIds, user) {
    try {
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      query.equalTo('status', "ACTIVE");
      query.containedIn('objectId', objectIds);
      query.include('store');
      
      if (user && user.role == 'store'){
        const pointerToUser = new Parse.User();
        pointerToUser.id = user.objectId;
        query.equalTo('store', pointerToUser);
      }
      const result = await query.find();

      return helper.toJSON(result);
    } catch (err) {
      throw err;
    }
  }
};
