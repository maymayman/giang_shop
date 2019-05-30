const formidable = require('formidable');
const util = require('util');
const fs = require('fs');
const public = process.env.PUBLIC_FOLDER || '/public';
const uploadDir = `.${public}/media`;
const numberSlice = public.length;

module.exports = {
  uploadFile: function(req, res, next){
    const form = new formidable.IncomingForm();
    const removeFile = [];
    const files = [];
    req.body = {};
    form.uploadDir = uploadDir;
  
    form.parse(req)
      .on('field', function (field, value) {
        if (req.body[field]) {
          if (!Array.isArray(req.body[field])) {
            const tmp = req.body[field];
            req.body[field] = [tmp];
          }
          req.body[field].push(value);
        } else {
          req.body[field] = value;
        }
      })
      .on('file', function (field, file) {
        if (file && file.type == 'application/octet-stream') {
          removeFile.push(file.path);
        }
        if (file && file.type != 'application/octet-stream') {
          const type = file.type.split('/')[1];
          const newPath = file.path + "." + type;
          fs.renameSync(file.path, newPath);
          const link = newPath.slice(numberSlice).replace("\\", "/");
          files.push(link);
        }
      })
      .on('end', function () {
        if (removeFile && removeFile.length > 0){
          for (let i = 0; i < removeFile.length; i++){
            fs.unlinkSync(removeFile[i]);
          }
        }
        req.files = files;
        next();
      });
  },
  
  
  
  
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