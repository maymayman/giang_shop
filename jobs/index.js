const schedule = require('node-schedule');

const WORKER = require('./worker')
 
/**
 * Render Thumbnails width = 400px
 * Query Products status = ACTIVE and thumbnails doesNotExisted
 * Render thumbnails from images
 * Save products with thumbnails path
 */

const RESIZE_PRODUCT_IMAGES_RULE = process.env.RESIZE_PRODUCT_IMAGES_RULE || '*/10 * * * * *';
// const ADD_ADDRESS = process.env.ADD_ADDRESS || '0 06 * * * *';
// const FIRST_TIME = process.env.FIRST_TIME || false;
schedule.scheduleJob(RESIZE_PRODUCT_IMAGES_RULE, async () => WORKER.renderThumbnails());
// if (FIRST_TIME) {
//   schedule.scheduleJob(ADD_ADDRESS, async () => WORKER.addCities());
//   schedule.scheduleJob(ADD_ADDRESS, async () => WORKER.addDistrict());
//   schedule.scheduleJob(ADD_ADDRESS, async () => WORKER.addWard());
// }
