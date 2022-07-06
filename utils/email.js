/* eslint-disable prettier/prettier */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `chukky blocks ${process.env.EMAIL_FROM}`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: htmlToText.htmlToText(html),
      html: html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Chukky Blocks!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
  }
}

// const sendEmail = async(options) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//         },
//     });

//     // Activate in gmail the less secure app option

//     const mailOptions = {
//         from: 'chukky blocks <hello@blockfi.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     }

//     await transporter.sendMail(mailOptions);

// }

module.exports = Email;
