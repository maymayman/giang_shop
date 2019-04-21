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
  find: async function(hasCategories, trigger) {
    try {
      if (Parse.Cache.Menus && !trigger) {
        return Parse.Cache.Menus;
      }

      const Menu = Parse.Object.extend('Menu');
      const query = new Parse.Query(Menu);
      query.equalTo('status', "ACTIVE");

      const menus = await query.find();

      if (!hasCategories) {
        return helper.toJSON(menus);
      }

      const promises = [];

      menus.forEach(menu => {
        promises.push(Help.findCategoriesByMenu(menu)); 
      });

      const parseMenus = await Promise.all(promises);
      const results = helper.toJSON(parseMenus);

      Parse.Cache.Menus = results;

      return results;
    } catch (err) {
      throw err;
    }
  }
}