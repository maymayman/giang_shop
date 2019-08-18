/* eslint-disable require-atomic-updates */
const helper = require('./helper');

const Category = Parse.Object.extend('Category');
const Menu = Parse.Object.extend('Menu');

const Help = {
  findCategoriesByMenu: async function (menu, limitRecord) {
    try {
      const limit = limitRecord ? limitRecord : 100;
      const query = new Parse.Query(Category);
      query.equalTo('menu', menu);
      query.equalTo('status', 'ACTIVE');
      query.limit(limit);

      let categories = await query.find();

      if (categories.length) {
        let promises = [];
        categories.forEach(category => {
          promises.push(Help.findSubCategoriesByCategory(category, limit));
        });

        categories = await Promise.all(promises);
      }

      menu.set('categories', helper.toJSON(categories));
      return menu;
    } catch (err) {
      throwError(err);
    }
  },

  findSubCategoriesByCategory: async function (category, limitRecord) {
    try {
      const limit = limitRecord ? limitRecord : 15;
      const Category = Parse.Object.extend('Category');
      const query = new Parse.Query(Category);
      query.equalTo('parent', category);
      query.equalTo('status', 'ACTIVE');
      query.ascending('position');
      query.limit(limit);

      const subCategories = await query.find();

      category.set('items', helper.toJSON(subCategories));

      return category;
    } catch (err) {
      throwError(err);
    }
  }
};

module.exports = {
  count: async function (options) {
    try {
      const query = new Parse.Query(Menu);

      if (!options && !options.user && !options.user.role == 'administrator') {
        query.equalTo('status', 'ACTIVE');
      }

      const count = await query.count();

      return count;
    } catch (err) {
      throwError(err);
    }
  },

  countCategory: async function (options) {
    try {
      const query = new Parse.Query(Category);

      if (options && options.filter){
        const pointerToMenu = new Menu();
        pointerToMenu.id = options.menu;

        query.equalTo('menu', pointerToMenu);
      }

      query.exists('menu');

      if (!options && !options.user && !options.user.role == 'administrator') {
        query.equalTo('status', 'ACTIVE');
      }

      const count = await query.count();

      return count;
    } catch (err) {
      throwError(err);
    }
  },

  countSubCategory: async function (options) {
    try {
      const query = new Parse.Query(Category);

      if (options && options.parent){
        const pointerToParent = new Category();
        pointerToParent.id = options.parent;

        query.equalTo('parent', pointerToParent);
      }

      if (options && options.status){
        query.equalTo('status', options.status);
      }

      query.doesNotExist('menu');

      if (!options && !options.user && !options.user.role == 'administrator') {
        query.equalTo('status', 'ACTIVE');
      }

      const count = await query.count();

      return count;
    } catch (err) {
      throwError(err);
    }
  },

  findByAdmin: async function (options) {
    try {

      const query = new Parse.Query(Menu);

      if(options && options.page && options.limit){
        const {skip, limit} = helper.pagination(options);
        query.skip(skip);
        query.limit(limit);
      }
      if (options && options.menu) {
        query.equalTo('objectId', options.menu);
      }
      query.ascending('position');

      const menus = await query.find();

      return helper.toJSON(menus);
    } catch (err) {
      throwError(err);
    }
  },

  find: async function (hasCategories, trigger) {
    try {
      if (Parse.Cache.Menus && !trigger) {
        return Parse.Cache.Menus;
      }
      const query = new Parse.Query(Menu);
      query.equalTo('status', 'ACTIVE');

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
      throwError(err);
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
      throwError(err);
    }
  },

  findByIdToUpdateCategory: async function (options, sessionToken) {
    try {
      const query = new Parse.Query(Category);
      query.equalTo('objectId', options.objectId);

      const result = await query.first();

      result.set('name', options.name);
      result.set('status', options.status);
      result.set('position', options.position);

      const category = await result.save(null, {sessionToken});

      return helper.toJSON(category);
    } catch (err) {
      throwError(err);
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
      throwError(err);
    }
  },

  createCategory: async function(options, sessionToken){
    try {
      const category = new Category();
      const pointerToMenu = new Menu();
      pointerToMenu.id = options.menuId;

      category.set('menu', pointerToMenu);
      category.set('name', options.name);
      category.set('status', options.status);
      category.set('position', options.position);

      const categorySaved = await category.save(null, {sessionToken});

      return helper.toJSON(categorySaved);
    } catch (err) {
      throwError(err);
    }
  },

  findCategoriesByAdmin: async function(options){
    try {

      const query = new Parse.Query(Category);

      if(options && options.menu){
        const pointerToMenu = new Menu();
        pointerToMenu.id = options.menu;

        query.equalTo('menu', pointerToMenu);
      }
      if(options && options.page && options.limit){
        const {skip, limit} = helper.pagination(options);
        query.skip(skip);
        query.limit(limit);
      }

      query.ascending('position');
      query.exists('menu');
      query.include('menu');

      const categories = await query.find();

      return helper.toJSON(categories);
    } catch (err) {
      throwError(err);
    }
  },

  findCategories: async function(options) {
    try {
      const query = new Parse.Query(Category);
      query.equalTo('status', 'ACTIVE');
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
      throwError(err);
    }
  },

  findParentCategories: async function(options) {
    try {
      const pointerMenu = new Menu();
      pointerMenu.id = options.menuId;

      const query = new Parse.Query(Category);
      query.equalTo('status', 'ACTIVE');
      query.equalTo('menu', pointerMenu);
      query.select(['name']);

      const results = await query.find();

      return helper.toJSON(results);
    } catch (err) {
      throwError(err);
    }
  },

  findSubCategoriesByAdmin: async function(options){
    try {
      const query = new Parse.Query(Category);

      if(options && options.parent){
        const pointerToParent = new Category();
        pointerToParent.id = options.parent;

        query.equalTo('parent', pointerToParent);
      }

      if (options && options.status){
        query.equalTo('status', options.status);
      }

      if (options && options.page && options.limit){
        const {skip, limit} = helper.pagination(options);
        query.skip(skip);
        query.limit(limit);
      }

      query.ascending('position');
      query.doesNotExist('menu');
      query.include('parent');

      const subCategories = await query.find();

      return helper.toJSON(subCategories);
    }catch (err) {
      throwError(err);
    }
  },

  createSubCategory: async function(options, sessionToken){
    try {
      const subCategory = new Category();
      const pointerToParent = new Category();
      pointerToParent.id = options.parentId;
      subCategory.set('parent', pointerToParent);
      subCategory.set('name', options.name);
      subCategory.set('status', options.status);
      subCategory.set('position', options.position);

      const subCategorySaved = await subCategory.save(null, {sessionToken});

      return helper.toJSON(subCategorySaved);
    }catch (err) {
      throwError(err);
    }
  },

  findAllCategories: async function () {
    try {
      const query = new Parse.Query(Menu);
      query.equalTo('status', 'ACTIVE');
      query.limit(1000);

      const menus = await query.find();

      const promises = [];

      menus.forEach(menu => {
        promises.push(Help.findCategoriesByMenu(menu, 1000));
      });

      const parseMenus = await Promise.all(promises);
      const results = helper.toJSON(parseMenus);

      return results;
    } catch (err) {
      throwError(err);
    }
  },
};
