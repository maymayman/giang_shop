module.exports = {
  toJSON: function(ParseObject) {
    if (Array.isArray(ParseObject)) {
      const results = [];
      if (ParseObject.length) {
        ParseObject.forEach(element => {
          results.push(element.toJSON());
        });
      }

      return results;
    }
    
    return ParseObject ? ParseObject.toJSON() : undefined;
  },

  pagination: function(options) {
    const page = options.page ? parseInt(options.page) : 1;
    const limit = options.limit ? parseInt(options.limit) : 20;
    return {
      skip: (page - 1) * limit,
      limit: limit
    }
  }
}