const consumerService = require('./services/consumerService');

console.log('consumerService import result:', consumerService);
console.log('typeof consumerService:', typeof consumerService);
console.log('consumerService.getConsumerById:', consumerService.getConsumerById);

if (consumerService && consumerService.getConsumerById) {
  try {
    const user = consumerService.getConsumerById('user_hk_standard');
    console.log('Test getConsumerById result:', user ? 'Found user' : 'User not found');
  } catch (error) {
    console.error('Error calling getConsumerById:', error.message);
  }
} else {
  console.error('getConsumerById method not available');
}
