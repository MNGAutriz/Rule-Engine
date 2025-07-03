const fs = require('fs');
const path = require('path');

const loadJson = (file) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file)));
};

const saveJson = (file, data) => {
  fs.writeFileSync(path.join(__dirname, '..', 'data', file), JSON.stringify(data, null, 2));
};

module.exports = {
  load: loadJson,
  save: saveJson
};
