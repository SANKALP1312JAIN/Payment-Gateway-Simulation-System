const { Worker } = require('bullmq');
const redis = require('../config/redis');
const Transaction = require('../models/Transaction');
const { transitionState } = require('../services/stateMachine');
const { acquireLock, releaseLock } = require('../services/lockService');
const webhookQueue = require('./webhookQueue');

const paymentWorker = new Worker('PaymentQueue', async (job) => {
    const { transactionId } = job.data;
    const lockKey = `payment_lock:${transactionId}`;

    // 1. Lightweight Redis Locking
    const lock = await acquireLock(lockKey, 30000);
    if (!lock) {
        // If lock exists -> requeue job by throwing an error that triggers a retry
        throw new Error('LOCKED');
    }

    try {
        const tx = await Transaction.findById(transactionId);
        if (!tx) throw new Error('Transaction not found');

        if (tx.status === 'SUCCESS' || tx.status === 'FAILED') {
            return { msg: 'Already processed' }; // Idempotent check
        }

        // 2. State Machine Enforcement
        let currentState = tx.status;
        if (currentState === 'CREATED') {
            await transitionState(transactionId, 'CREATED', 'PROCESSING');
            currentState = 'PROCESSING';
        }

        // gateway simulation logic
        const rand = Math.random() * 100;
        let isSuccess = false;
        let errType = null;

        if (rand < 70) {
            isSuccess = true;
        } else if (rand < 85) {
            errType = 'TIMEOUT';
        } else {
            errType = 'HARD_FAILURE';
        }

        // Simulate small processing delay
        await new Promise(res => setTimeout(res, 500));

        // 3. Evaluate Results
        if (isSuccess) {
            // Transition to SUCCESS
            await transitionState(transactionId, currentState, 'SUCCESS', {
                gatewayResponse: { status: 'success', simulated: true }
            });

            // Enqueue webhook
            await webhookQueue.add('sendWebhook', { transactionId }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 1000 }
            });
            return { success: true };
        } else {
            // It's a failure (Timeout or Hard Failure)
            const attemptsMade = job.attemptsMade + 1;
            const maxRetries = job.opts.attempts;

            const newRetryCount = tx.retryCount + 1;

            // If it's the last attempt that failed, mark as FAILED
            if (attemptsMade >= maxRetries) {
                await transitionState(transactionId, currentState, 'FAILED', {
                    retryCount: newRetryCount,
                    gatewayResponse: { error: errType, final: true }
                });
                // We still return normally or throw? If we throw, BullMQ will just mark it as failed (no more retries).
                // Let's throw so BullMQ registers it as a failed job in the queue logs.
                throw new Error(errType);
            } else {
                // We have retries left. 
                // Timeout must trigger retry. Hard failure should only retry if retryCount < maxRetries (which is true here).
                // Transition to RETRYING
                await transitionState(transactionId, currentState, 'RETRYING', {
                    retryCount: newRetryCount,
                    gatewayResponse: { error: errType }
                });
                throw new Error(errType); // Let BullMQ perform the retry with backoff.
            }
        }
    } finally {
        await releaseLock(lockKey);
    }
}, { connection: redis });

paymentWorker.on('failed', (job, err) => {
    console.error(`Payment Job ${job?.id} failed with error: ${err.message}`);
});
paymentWorker.on('completed', (job) => {
    console.log(`Payment Job ${job?.id} completed`);
});

module.exports = paymentWorker;
