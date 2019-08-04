const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const ORDER_SUBJECT = require('./orderSubject');
const SEND_MAIL = require('./configSendMail');


module.exports = {
  sendMailToUser: async (order, user) =>{
    try {
      let products = [];
      const pathTemplate = path.join(__dirname, '..', '..', 'views/templateSendMail/orderTemplate.ejs');
      const template = await fs.readFileSync(pathTemplate, 'utf-8');

      Object.keys(order.items).forEach(function(key) {
        products.push(order.items[key]);
      });
      let templateSendToCustomer = ejs.render(template, {order: order, products:products, orderStatus: ORDER_SUBJECT.ORDER_CONFIRM_STATUS, user: user});
      const sendMailToCustomer = {
        toEmail: user.email,
        subject: ORDER_SUBJECT.ORDER_CONFIRM,
        html: templateSendToCustomer
      };
      SEND_MAIL.sendMail(sendMailToCustomer);
      console.log(`Send to '${user.email}' of customer '${user.username}' success !!!!!`);
    } catch (error) {
      console.error(error, "++++++++++++++++++");
    }
  },
  sendMailToStore: async (order, store) =>{
    try {
      let products = [];
      const pathTemplate = path.join(__dirname, '..', '..', 'views/templateSendMail/orderTemplate.ejs');
      const template = await fs.readFileSync(pathTemplate, 'utf-8');

      Object.keys(order.items).forEach(function(key) {
        products.push(order.items[key]);
      });
      let templateSendToStore = ejs.render(template, {order: order, products:products, orderStatus: ORDER_SUBJECT.ORDER_NOTIFICATION_STORE, user: store});
      const sendMailToStore = {
        toEmail: store.email,
        subject: ORDER_SUBJECT.ORDER_NOTIFICATION_STORE,
        html: templateSendToStore
      };
      SEND_MAIL.sendMail(sendMailToStore);
      console.log(`Send to '${store.email}' of customer '${store.username}' success !!!!!`);
    } catch (error) {
      console.error(error, "++++++++++++++++++");
    }
  },
  sendMailToAdmin: async (order, admin) =>{
    try {
      let products = [];
      const pathTemplate = path.join(__dirname, '..', '..', 'views/templateSendMail/orderTemplate.ejs');
      const template = await fs.readFileSync(pathTemplate, 'utf-8');

      Object.keys(order.items).forEach(function(key) {
        products.push(order.items[key]);
      });
      let templateSendToAdmin = ejs.render(template, {order: order, products:products, orderStatus: ORDER_SUBJECT.ORDER_NOTIFICATION_ADMIN, user: admin});
      const sendMailToAdmin = {
        toEmail: admin.email,
        subject: ORDER_SUBJECT.ORDER_NOTIFICATION_ADMIN,
        html: templateSendToAdmin
      };
      SEND_MAIL.sendMail(sendMailToAdmin);
      console.log(`Send to '${admin.email}' of customer '${admin.username}' success !!!!!`);
    } catch (error) {
      console.error(error, "++++++++++++++++++");
    }
  },
};
