require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const translate = require('./src/translate');
const pagination = require('./src/pagination');

const app = express();

// Render asigna el puerto mediante process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');

// Archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public'))); // Asegúrate que la carpeta "public" esté en el mismo directorio

// Ruta principal para obtener y filtrar imágenes
app.get('/', async (req, res) => {
  const { department, keyword, location, page = 1 } = req.query;
  const limit = 20;

  try {
    // Llama a la API del Museo Metropolitano para obtener objetos
    const { data } = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/search', {
      params: {
        departmentId: department,
        q: keyword,
        geoLocation: location,
        hasImages: true
      }
    });

    const totalItems = data.total;
    const paginatedItems = pagination.paginate(data.objectIDs, page, limit);
    
    const objectsPromises = paginatedItems.map(id =>
      axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
    );
    
    const objects = await Promise.all(objectsPromises);
    const translatedObjects = await translate.translateObjects(objects.map(obj => obj.data));

    res.render('index', {
      objects: translatedObjects,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit)
    });
  } catch (error) {
    console.error('Error retrieving data from the Met Museum API:', error);
    res.status(500).send('Error retrieving data from the Met Museum API');
  }
});

// Ruta para ver más imágenes de un objeto
app.get('/details/:id', async (req, res) => {
  const objectId = req.params.id;

  try {
    const { data } = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
    res.render('details', { object: data });
  } catch (error) {
    console.error('Error retrieving object details:', error);
    res.status(500).send('Error retrieving object details');
  }
});

// Inicia el servidor y escucha en el puerto asignado por Render
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
