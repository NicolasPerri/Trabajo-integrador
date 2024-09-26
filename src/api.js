const axios = require('axios');
const translate = require('node-google-translate-skidz');
require('dotenv').config();

const MET_API_URL = process.env.MET_API_URL;

// Función para obtener objetos de arte de la API
async function getArtObjects() {
  try {
    const response = await axios.get(`${MET_API_URL}/objects?departmentIds=11&hasImages=true`);
    const objectIds = response.data.objectIDs.slice(0, 20); // Limitado a 20 objetos
    const objects = await Promise.all(objectIds.map(async (id) => {
      const objectData = await axios.get(`${MET_API_URL}/objects/${id}`);
      const object = objectData.data;

      // Traducción al español
      const title = await translateText(object.title);
      const culture = await translateText(object.culture || 'Desconocido');
      const dynasty = await translateText(object.dynasty || 'Desconocido');

      return {
        title,
        culture,
        dynasty,
        imageUrl: object.primaryImage || 'https://via.placeholder.com/300',
        objectDate: object.objectDate || 'Desconocida',
      };
    }));

    return objects;
  } catch (error) {
    console.error('Error al obtener los objetos de arte:', error);
    throw error;
  }
}

// Función para traducir texto al español
function translateText(text) {
  return new Promise((resolve, reject) => {
    translate({
      text: text,
      source: 'en',
      target: 'es',
    }, function (result) {
      resolve(result.translation);
    });
  });
}

module.exports = { getArtObjects };
