const nodemailer = require('nodemailer');


module.exports = {
  sendMail: async function (options) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'consignistasg@gmail.com',
          pass: 'Trangiaan@2015',
        }
      });

      const info = await transporter.sendMail({
        from: 'consignistasg@gmail.com', // sender address
        to: options.toEmail, // list of receivers
        subject: options.subject, // Subject line
        html: options.html // html body
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error(error, "++++++++++++++++++");
    }
  },
};
