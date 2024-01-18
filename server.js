const express = require('express');
const cors = require('cors')
const { Resend } = require('resend');
require('dotenv').config()


const app = express();
const resend = new Resend(process.env.RESEND_APIKEY);

app.use(cors())

const SECRET_PASSWORD = process.env.PASSWORD


app.use(express.json());

const emailValidator = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Dirección de correo electrónico no válida.' });
  }

  next();
};

app.get('/weather', async (req, res) => {
  const weatherApiKey = process.env.WEATHER_API_KEY;
  const lat = req.query.lat || '41.388';
  const lon = req.query.lon || '2.1589';

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para enviar emails
app.post('/send-email',emailValidator ,async (req, res) => {
  try {
   
    const { ownapikey } = req.headers;
    const {subject, html} = req.body;
    console.log(ownapikey)
    if (ownapikey !== SECRET_PASSWORD) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
      }
    
    const payload ={

        from: "onboarding@resend.dev",
        to:"davidmasbaga@gmail.com",
        subject: subject,
        html:html

    }

    const { data, error } = await resend.emails.send(
      payload
    );

    if (error) {
      return res.status(400).json({ error });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
