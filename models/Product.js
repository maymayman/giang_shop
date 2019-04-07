const helper = require('./helper');

const Help = {
  findCategoriesByMenu: async function(menu) {
    try {
      const Category = Parse.Object.extend('Category');
      const query = new Parse.Query(Category);
      query.equalTo('menu', menu);
      query.equalTo('status', "ACTIVE");

      let categories = await query.find();

      if (categories.length) {
        let promises = [];
        categories.forEach(category => {
          promises.push(Help.findSubCategoriesByCategory(category));
        });

        categories = await Promise.all(promises);
      }
      
      menu.set('categories', helper.toJSON(categories));
      return menu;
    } catch (err) {
      throw err;
    }
  },

  findSubCategoriesByCategory: async function(category) {
    try {
      const Category = Parse.Object.extend('Category');
      const query = new Parse.Query(Category);
      query.equalTo('parent', category);
      query.equalTo('status', "ACTIVE");

      const subCategories = await query.find();

      category.set('items', helper.toJSON(subCategories));

      return category;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = {
  find: async function(options) {
    try {
      const { skip, limit } = helper.pagination(options);
      const Product = Parse.Object.extend('Product');
      const query = new Parse.Query(Product);
      query.equalTo('status', "ACTIVE");
      query.skip(skip);
      query.limit(limit);

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throw err;
    }
  }
}