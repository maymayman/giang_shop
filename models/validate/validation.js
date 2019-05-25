module.exports = {
  
  validationMenu: async function (options, action) {
    try {
      if (action) {
        const Menu = Parse.Object.extend('Menu');
        const query1 = new Parse.Query(Menu);
        const query2 = new Parse.Query(Menu);
        
        switch (action) {
          case 'EDIT':
            
            query1.notEqualTo('objectId', options.objectId);
            query2.notEqualTo('objectId', options.objectId);
            
            query1.equalTo('name', options.name);
            query2.equalTo('position', options.position);
            
            const compoundQuery = Parse.Query.or(query1, query2);
            
            const result = await  compoundQuery.first();
            if (result) {
              return false;
            } else {
              return true;
            }
            break;
          case 'CREATE':
            
            query1.equalTo('name', options.name);
            query2.equalTo('position', options.position);
            
            const compoundQueryCreate = Parse.Query.or(query1, query2);
            
            const resultCreate = await  compoundQueryCreate.first();
            if (resultCreate) {
              return false;
            } else {
              return true;
            }
            break;
        }
      } else {
        return false
      }
    } catch (err) {
      throw err;
    }
  },
  
  validationCategory: async function (options, action) {
    try {
      if (action) {
        const Category = Parse.Object.extend('Category');
        const Menu = Parse.Object.extend('Menu');
        const pointerToMenu = new Menu();
        pointerToMenu.id = options.menuId;
        const query = new Parse.Query(Category);
        const query1 = new Parse.Query(Category);
  
        switch (action) {
          case 'EDIT':
            query.notEqualTo('objectId', options.objectId);
            query1.notEqualTo('objectId', options.objectId);
  
            query.equalTo('position', options.position);
            query1.equalTo('name', options.name);
            
            query.equalTo('menu', pointerToMenu);
            query1.equalTo('menu', pointerToMenu);
            
            const compoundQuery = Parse.Query.or(query, query1);
  
            const result = await compoundQuery.first();
            if (result){
              return false;
            }else {
              return true;
            }
            break;
          case 'CREATE':
            query.equalTo('position', options.position);
            query1.equalTo('name', options.name);
  
            query.equalTo('menu', pointerToMenu);
            query1.equalTo('menu', pointerToMenu);
  
            const compoundQueryCreate = Parse.Query.or(query, query1);
  
            const resultCreate = await compoundQueryCreate.first();
            if (resultCreate){
              return false;
            }else {
              return true;
            }
            break;
        }
      }else {
        return false
      }
    } catch (err) {
      throw err
    }
  },
  
  validationSubCategory: async function (options, action) {
    try {
      const Category = Parse.Object.extend('Category');
      const Menu = Parse.Object.extend('Menu');
      
      const pointerToMenu = new Menu();
      pointerToMenu.id = options.menuId;
  
      const pointerToParent = new Category();
      pointerToParent.id = options.parentId;
      
      const query = new Parse.Query(Category);
      const query1 = new Parse.Query(Category);
      
      switch (action) {
        case 'EDIT':
          query.notEqualTo('objectId', options.objectId);
          query1.notEqualTo('objectId', options.objectId);
      
          query.equalTo('position', options.position);
          query1.equalTo('name', options.name);
      
          query.equalTo('menu', pointerToMenu);
          query1.equalTo('menu', pointerToMenu);
          
          query.equalTo('parent', pointerToParent);
          query1.equalTo('parent', pointerToParent);
      
          const compoundQuery = Parse.Query.or(query, query1);
      
          const result = await compoundQuery.first();
          if (result){
            return false;
          }else {
            return true;
          }
          break;
        case 'CREATE':
          query.equalTo('position', options.position);
          query1.equalTo('name', options.name);
      
          query.equalTo('menu', pointerToMenu);
          query1.equalTo('menu', pointerToMenu);
          
          query.equalTo('parent', pointerToParent);
          query1.equalTo('parent', pointerToParent);
          
          const compoundQueryCreate = Parse.Query.or(query, query1);
      
          const resultCreate = await compoundQueryCreate.first();
          if (resultCreate){
            return false;
          }else {
            return true;
          }
          break;
      }
    } catch (err) {
      throw err
    }
  },
  
  validationBanner: async function (options) {
    try {
      const Banner = Parse.Object.extend('Banner');
      const query = new Parse.Query(Banner);
      const query1 = new Parse.Query(Banner);
      query.equalTo('name', options.title);
      query1.equalTo('position', options.position);
      const compoundQueryCreate = Parse.Query.or(query, query1);
      const resultCreate = await compoundQueryCreate.first();
      if (resultCreate){
        return true;
      }else {
        return false;
      }
    } catch (err) {
      throw err
    }
  },
  
  validationMenuCategoyBeforeSave: async function (options) {
    try {
      let menuIds = [];
      let categoryIds = [];
      options.forEach(function (option) {
        if (!menuIds.includes(option.split(':')[0])) {
          menuIds.push(option.split(':')[0]);
        }
        categoryIds.push(option.split(':')[1]) ;
        categoryIds.push(option.split(':')[2]) ;
      });
      return { menuIds: menuIds, categoryIds: categoryIds };
    } catch (err) {
      throw err
    }
  }
};