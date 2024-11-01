const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configura los orígenes permitidos
const allowedOrigins = ['https://worldit.com.ar'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'La política CORS para este sitio no permite acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/enviar-contacto', async (req, res) => {
  console.log('Recibida solicitud de contacto:', req.body);
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    console.log('Datos incompletos');
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    console.log('Intentando enviar email...');
    await transporter.sendMail({
      from: `"World IT" <${process.env.SMTP_USER}>`,
      to: process.env.DESTINO_EMAIL,
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`,
      html: `<p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong> ${message}</p>`,
    });

    console.log('Email enviado con éxito');
    res.status(200).json({ message: 'Email enviado con éxito' });
  } catch (error) {
    console.error('Error detallado al enviar email:', error);
    res.status(500).json({ message: 'Error al enviar email', error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

module.exports = app;