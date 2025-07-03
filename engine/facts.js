const consumerService = require('../services/consumerService');

module.exports = (engine) => {
  engine.addFact('consumerState', async (params, almanac) => {
    const consumerId = await almanac.factValue('consumerId');
    const consumer = consumerService.getConsumerById(consumerId);
    return consumer?.state || 'New';
  });

  engine.addFact('birthMonth', async (params, almanac) => {
    const consumerId = await almanac.factValue('consumerId');
    const consumer = consumerService.getConsumerById(consumerId);
    return consumer?.birthMonth;
  });

  engine.addFact('consumerId', (params) => params.consumerId);
};
