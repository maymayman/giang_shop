module.exports = {

  validationMenu: async function(options, action) {
    try {
      if (action){
        const Menu = Parse.Object.extend('Menu');
        const query1 = new Parse.Query(Menu);
        const query2 = new Parse.Query(Menu);
        
        switch (action)  {
          case 'EDIT':
            
            query1.notEqualTo('objectId', options.objectId);
            query2.notEqualTo('objectId', options.objectId);
  
            query1.equalTo('name', options.name);
            query2.equalTo('position', options.position);
  
            const compoundQuery = Parse.Query.or(query1, query2);
            
            const result = await  compoundQuery.first();
            if(result){
              return false;
            }else {
              return true;
            }
            break;
          case 'CREATE':
  
            query1.equalTo('name', options.name);
            query2.equalTo('position', options.position);
  
            const compoundQueryCreate = Parse.Query.or(query1, query2);
  
            const resultCreate = await  compoundQueryCreate.first();
            if(resultCreate){
              return false;
            }else {
              return true;
            }
            break;
        }
      }else {
        return false
      }
    }catch (err) {
      throw err;
    }
  }
};