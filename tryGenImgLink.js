const { log } = require('console');
const fs = require('fs');

function transformArray(inputArray) {
  function getSuffix(imgMain) {
    if (typeof imgMain !== 'string') {
      return null;
    }
    const lastSlashIndex = imgMain.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      return null;
    }
    return imgMain.substring(lastSlashIndex);
  }

  return inputArray.map(item => {
    const { url, imgMain, imgs: originalImgs } = item;
    let newImgs = [];

    if (imgMain && typeof imgMain === 'string') {
      const suffix = getSuffix(imgMain);
      if (suffix) {
        const base = "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/";
        const values = Object.values(originalImgs); 
        newImgs = values.map(value => `${base}${value}${suffix}`);
      }
    }

    return { url, imgMain, imgs: newImgs };
  });
}
const inputArray = JSON.parse(fs.readFileSync('b1f1_nikeIMG.json'));
const outputArray = transformArray(inputArray);

fs.writeFileSync('nikeGENimgsLinks2.json', JSON.stringify(outputArray, null, 2));
log('Done!');
console.log('Done!');

