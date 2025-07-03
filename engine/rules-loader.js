const fs = require('fs');
const path = require('path');

function loadRules(market, eventType) {
  const file = `${market.toLowerCase()}_${eventType.toLowerCase()}.json`;
  const rulePath = path.join(__dirname, '..', 'rules', file);
  if (!fs.existsSync(rulePath)) throw new Error(`Rule file not found: ${file}`);
  return JSON.parse(fs.readFileSync(rulePath));
}

module.exports = loadRules;
