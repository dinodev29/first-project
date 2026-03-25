const mailgun = require('mailgun.js');
const FormData = require('form-data');

const mg = new mailgun(FormData);

const client = mg.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

module.exports = client;
