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
    return {
      skip: options.skip ? parseInt(options.skip) : 0,
      limit: options.limit ? parseInt(options.limit) : 10
    }
  }
}