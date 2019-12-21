const schedule = require('node-schedule');

const WORKER = require('./worker')
 
/**
 * Render Thumbnails width = 400px
 * Query Products status = ACTIVE and thumbnails doesNotExisted
 * Render thumbnails from images
 * Save products with thumbnails path
 */

const RESIZE_PRODUCT_IMAGES_RULE = process.env.RESIZE_PRODUCT_IMAGES_RULE || '*/10 * * * * *';
schedule.scheduleJob(RESIZE_PRODUCT_IMAGES_RULE, async () => WORKER.renderThumbnails());