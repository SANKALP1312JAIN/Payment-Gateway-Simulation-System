const { Queue } = require('bullmq');
const redis = require('../config/redis');

// Create the webhook queue
const webhookQueue = new Queue('WebhookQueue', {
    connection: redis
});

module.exports = webhookQueue;
