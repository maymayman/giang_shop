const helper = require('./helper');

const Category = Parse.Object.extend('Category');
const Menu = Parse.Object.extend('Menu');

const Help = {
  findCategoriesByMenu: async function (menu) {
    try {
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
  
  findSubCategoriesByCategory: async function (category) {
    try {
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
  count: async function (options) {
    try {
      const Menu = Parse.Object.extend('Menu');
      const query = new Parse.Query(Menu);
      
      if (!options && !options.user && !options.user.role == 'administrator') {
        query.equalTo('status', "ACTIVE");
      }
      
      const count = await query.count();
      
      return count;
    } catch (err) {
      throw err;
    }
  },
  
  findByAdmin: async function (options) {
    try {
      const {skip, limit} = helper.pagination(options);
  
      const Menu = Parse.Object.extend('Menu');
      const query = new Parse.Query(Menu);
      
      query.skip(skip);
      query.limit(limit);
      query.ascending('position');
      
      const menus = await query.find();
      
      return helper.toJSON(menus);
    } catch (err) {
      throw err;
    }
  },
  
  find: async function (hasCategories, trigger) {
    try {
      if (Parse.Cache.Menus && !trigger) {
        return Parse.Cache.Menus;
      }
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
  },
  
  findByIdToUpdate: async function (options, sessionToken) {
    try {
      const query = new Parse.Query(Menu);
      query.equalTo('objectId', options.objectId);
      
      const result = await query.first();
      
      result.set('name', options.name);
      result.set('status', options.status);
      result.set('position', options.position);
      
      const menu = await result.save(null, {sessionToken});
      
      return helper.toJSON(menu);
    } catch (err) {
      throw err;
    }
  },
  
  create: async function(options, sessionToken){
    try {
      const menu = new Menu();
  
      menu.set('name', options.name);
      menu.set('status', options.status);
      menu.set('position', options.position);
    
      const menuSaved = await menu.save(null, {sessionToken});
    
      return helper.toJSON(menuSaved);
    } catch (err) {
      throw err;
    }
  },

  findCategories: async function(options) {
    try {
      const query = new Parse.Query(Category);
      query.equalTo('status', "ACTIVE");
      query.select(['name']);

      if (options.parentId) {
        const pointerCate = new Category();
        pointerCate.id = options.parentId;
        query.equalTo('parent', pointerCate);
      }

      if (options.keyword) {
        query.matches('name', new RegExp(options.keyword, 'i'));
      }

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throw (err);
    }
  },
  findParentCategories: async function(options) {
    try {
      const Menu = Parse.Object.extend('Menu');
      const pointerMenu = new Menu();
      pointerMenu.id = options.menuId;

      const query = new Parse.Query(Category);
      query.equalTo('status', "ACTIVE");
      query.equalTo('menu', pointerMenu);
      query.select(['name'])

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throw (err);
    }
  },
};

