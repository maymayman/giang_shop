const fs = require('fs');

module.exports = {
  fileExisted: async (path) => {
    return new Promise((resolve) => {
      fs.access(path, fs.F_OK, (err) => {
        err ? console.error(err.stack) : console.log(`${path} is existed`);
        const result = err ? false : true;
        
        resolve(result);
      });
    });
  },

  asyncTiny: async (promises) => {
    if (Array.isArray(promises)) {
      return Promise.all(promises).catch(err => {
        throw err;
      });
    }
    return promises.catch(err => {
      throw err;
    });
  },
};
