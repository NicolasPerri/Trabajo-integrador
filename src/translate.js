const translate = require('node-google-translate-skidz');

async function translateObjects(objects) {
  const translations = await Promise.all(objects.map(async obj => {
    const [translatedTitle, translatedCulture, translatedDynasty] = await Promise.all([
      translateText(obj.title),
      translateText(obj.culture),
      translateText(obj.dynasty || '')
    ]);

    return {
      ...obj,
      title: translatedTitle,
      culture: translatedCulture,
      dynasty: translatedDynasty
    };
  }));

  return translations;
}

function translateText(text) {
  return new Promise((resolve, reject) => {
    translate({
      text: text,
      target: 'es'
    }, (result) => resolve(result.translation));
  });
}

module.exports = { translateObjects };
