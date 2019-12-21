const HELP = require('./helps') 
const Product = Parse.Object.extend('Product');

module.exports = {
  renderThumbnails: async () => {
    try {
      const query = new Parse.Query(Product);
      query.doesNotExist('thumbnails')
           .equalTo('status', 'ACTIVE')
           .limit(1000);
  
      const products = await query.find();
  
      return await HELP.resizeImages(products);
    } catch (error) {
      console.error(`${new Date()} [JOBS] renderThumbnails: ${error.stack}`);
    }
  }
};