module.exports = {
  validationMenu: async function (options, action) {
    try {
      if (action) {
        const Menu = Parse.Object.extend('Menu');
        const query1 = new Parse.Query(Menu);
        const query2 = new Parse.Query(Menu);
        let compoundQuery, compoundQueryCreate, result, resultCreate;
        
        switch (action) {
        case 'EDIT':
            
          query1.notEqualTo('objectId', options.objectId);
          query2.notEqualTo('objectId', options.objectId);
            
          query1.equalTo('name', options.name);
          query2.equalTo('position', options.position);
            
          compoundQuery = Parse.Query.or(query1, query2);
            
          result = await  compoundQuery.first();
          if (result) {
            return false;
          } else {
            return true;
          }
        case 'CREATE':
            
          query1.equalTo('name', options.name);
          query2.equalTo('position', options.position);
            
          compoundQueryCreate = Parse.Query.or(query1, query2);
            
          resultCreate = await  compoundQueryCreate.first();
          if (resultCreate) {
            return false;
          } else {
            return true;
          }
        }
      } else {
        return false;
      }
    } catch (err) {
      throwError(err);
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
        let compoundQuery, compoundQueryCreate, result, resultCreate;
  
        switch (action) {
        case 'EDIT':
          query.notEqualTo('objectId', options.objectId);
          query1.notEqualTo('objectId', options.objectId);
  
          query.equalTo('position', options.position);
          query1.equalTo('name', options.name);
            
          query.equalTo('menu', pointerToMenu);
          query1.equalTo('menu', pointerToMenu);
            
          compoundQuery = Parse.Query.or(query, query1);
  
          result = await compoundQuery.first();
          if (result){
            return false;
          }else {
            return true;
          }
        case 'CREATE':
          query.equalTo('position', options.position);
          query1.equalTo('name', options.name);
  
          query.equalTo('menu', pointerToMenu);
          query1.equalTo('menu', pointerToMenu);
  
          compoundQueryCreate = Parse.Query.or(query, query1);
  
          resultCreate = await compoundQueryCreate.first();
          if (resultCreate){
            return false;
          }else {
            return true;
          }
        }
      }else {
        return false;
      }
    } catch (err) {
      throwError(err);
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
      
      let compoundQuery, compoundQueryCreate, result, resultCreate;
      
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
      
        compoundQuery = Parse.Query.or(query, query1);
      
        result = await compoundQuery.first();
        if (result){
          return false;
        }else {
          return true;
        }
      case 'CREATE':
        query.equalTo('position', options.position);
        query1.equalTo('name', options.name);
      
        query.equalTo('menu', pointerToMenu);
        query1.equalTo('menu', pointerToMenu);
          
        query.equalTo('parent', pointerToParent);
        query1.equalTo('parent', pointerToParent);
          
        compoundQueryCreate = Parse.Query.or(query, query1);
      
        resultCreate = await compoundQueryCreate.first();
        if (resultCreate){
          return false;
        }else {
          return true;
        }
      }
    } catch (err) {
      throwError(err);
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
      throwError(err);
    }
  },
  
  validationMenuCategoyBeforeSave: function (options) {
    const menuIds = [];
    const categoryIds = [];
    const relativeCategoryIds = [];
    options.forEach(function (option) {
      
      if (!menuIds.includes(option.split(':')[0])) {
        menuIds.push(option.split(':')[0]);
      }
      relativeCategoryIds.push(option.split(':')[1]) ;
      relativeCategoryIds.push(option.split(':')[2]) ;
      categoryIds.push(option.split(':')[2]) ;
    });
    return { menuIds, categoryIds, relativeCategoryIds };
  }
};