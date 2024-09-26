require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const api = require('./api');

// Configurar motor de vistas EJS
app.set('view engine', 'ejs');

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', async (req, res) => {
  try {
    const objects = await api.getArtObjects();
    res.render('index', { objects });
  } catch (error) {
    res.status(500).send('Error al obtener datos del Met Museum.');
  }
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
