const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"Fitnest LLC" <robot@fitnest.app>',
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
