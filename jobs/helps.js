const fs = require('fs')
const sharp = require('sharp');
const { UTILS } = require('../const')
const publicPath = 'public/'

const validImageAndThumb = async (pathImage, pathThumb) => {
  try {
    const [imageExisted, thumExisted] = await Promise.all([
      UTILS.fileExisted(pathImage),
      UTILS.fileExisted(pathThumb)
    ])
    
    if (!imageExisted) throw new Error(`${pathImage} Not Found.`);
    if (thumExisted) throw new Error(`${pathThumb} Was Existed.`);

    return true;
  } catch (error) {
    throw error
  }
};

const resize = async (image) => {
  try {
    const [name, type] = image.split('.')
    const pathImage = `${__basedir}/${publicPath}/${image}`
    const pathThumb = `${__basedir}/${publicPath}/${name}_width_400.${type}`
    await validImageAndThumb(pathImage, pathThumb);
    
    const readStream = fs.createReadStream(pathImage);
    const writeStream = fs.createWriteStream(`${pathThumb}`)
    readStream.pipe(sharp().resize(400)).pipe(writeStream)
              .on('finish', () => console.log('resize tream file done: ' + image));

    return `${name}_width_400.${type}`;
  } catch (error) {
    throw error;
  }
};
const resizeImage = async (product) => {
  try {
    const thumbnails = await UTILS.asyncTiny(
      product.get('images').map((image) => resize(image))
    )

    return await product.save({ thumbnails })
  } catch (err) {
    throw err
  }
};
const resizeImages = async (products) => await UTILS.asyncTiny(products.map((product) => resizeImage(product)));

module.exports = { resize, resizeImage, resizeImages };
