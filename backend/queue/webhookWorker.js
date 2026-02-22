const { Worker } = require('bullmq');
const redis = require('../config/redis');
const Transaction = require('../models/Transaction');

const webhookWorker = new Worker('WebhookQueue', async (job) => {
    const { transactionId } = job.data;

    // Simulate webhook call
    const rand = Math.random() * 100;
    // 20% failure chance
    const isSuccess = rand >= 20;

    // Simulate network delay
    await new Promise(res => setTimeout(res, 300));

    if (isSuccess) {
        await Transaction.findByIdAndUpdate(transactionId, { webhookStatus: 'SUCCESS' });
        return { success: true };
    } else {
        // Check if it's the last attempt
        const attemptsMade = job.attemptsMade + 1;
        if (attemptsMade >= job.opts.attempts) {
            await Transaction.findByIdAndUpdate(transactionId, { webhookStatus: 'FAILED' });
        }
        throw new Error('Webhook call failed');
    }
}, { connection: redis });

webhookWorker.on('failed', (job, err) => {
    console.error(`Webhook Job ${job?.id} failed: ${err.message}`);
});
webhookWorker.on('completed', (job) => {
    console.log(`Webhook Job ${job?.id} completed successfully`);
});

module.exports = webhookWorker;
