const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors());

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
}

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
});

router.post('/contact', cors(corsOptions), (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const message = req.body.message;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Все поля обязательны к заполнению!' });
  }

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_SEND_TO,
    subject: 'Новая заявка ' + name,
    html:
    `<table style="border-spacing: 10px;">
      <tr>
        <th style="text-align: left;">Имя:</th>
        <td style="text-align: left;">${name}</td>
      </tr>
      <tr>
        <th style="text-align: left;">Телефон:</th>
        <td style="text-align: left;">${phone}</td>
      </tr>
      <tr>
        <th style="text-align: left;">Сообщение:</th>
        <td style="text-align: left;">${message}</td>
      </tr>
    </table>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else {
      return res.status(200).json({ message: 'Успешно отправлено!', info: info });
    }
  });
});

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);
