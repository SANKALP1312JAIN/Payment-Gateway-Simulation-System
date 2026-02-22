const { Queue } = require('bullmq');
const redis = require('../config/redis');



// Create the payment queue
const paymentQueue = new Queue('PaymentQueue', {
    connection: redis // use the existing ioredis instance
});

module.exports = paymentQueue;
