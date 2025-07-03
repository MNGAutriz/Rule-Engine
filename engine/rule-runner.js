const { Engine } = require('json-rules-engine');
const loadRules = require('./rules-loader');
const addFacts = require('./facts');
const consumerService = require('../services/consumerService');
const { v4: uuidv4 } = require('uuid');

async function runRules(input) {
  const { market, eventType, consumerId, eventId } = input;
  const rules = loadRules(market, eventType);
  const engine = new Engine(rules);
  addFacts(engine);

  const pointEvents = [];

  engine.on('success', async (event) => {
    pointEvents.push(event);
  });

  const facts = { ...input, consumerId };
  await engine.run(facts);

  const totalPoints = pointEvents.reduce((acc, e) => acc + e.params.points, 0);
  const breakdown = pointEvents.map((e) => ({
    ruleId: e.params.ruleId,
    points: e.params.points,
    description: e.params.description,
    campaignId: e.params.campaignId || null,
    campaignCode: e.params.campaignCode || null,
    campaignStart: e.params.campaignStart || null,
    campaignEnd: e.params.campaignEnd || null
  }));

  const updatedBalance = consumerService.updateBalance(consumerId, totalPoints);

  const result = {
    consumerId,
    eventId,
    eventType,
    totalPointsAwarded: totalPoints,
    pointBreakdown: breakdown,
    errors: [],
    resultingBalance: updatedBalance
  };

  consumerService.logEvent({ ...result, timestamp: new Date().toISOString() });
  return result;
}

module.exports = runRules;
