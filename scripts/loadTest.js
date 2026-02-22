const axios = require('axios');
const crypto = require('crypto');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const NUM_TRANSACTIONS = 5000; // Requirement: Simulate 2000-3000 transactions
const BATCH_SIZE = 50; // Throttle requests to avoid crashing free tier hosting
const DELAY_BETWEEN_BATCHES_MS = 2000;

const paymentMethods = ['UPI', 'CARD', 'WALLET'];

function generateIdempotencyKey() {
    return crypto.randomBytes(16).toString('hex');
}

function getRandomMethod() {
    return paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendBatch(batchIndex) {
    const promises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
        const amount = Math.floor(Math.random() * 900) + 100;

        promises.push(
            axios.post(`${API_URL}/payments`, {
                userId: `user_load_test_${Math.floor(Math.random() * 1000)}`,
                amount: amount,
                currency: 'USD',
                paymentMethod: getRandomMethod()
            }, {
                headers: {
                    'Idempotency-Key': generateIdempotencyKey()
                }
            }).catch(err => {
                // Ignore errors to keep load test running, just record them
                return { error: true, data: err?.response?.data || err.message };
            })
        );
    }

    const results = await Promise.all(promises);
    const successCount = results.filter(r => !r.error).length;
    console.log(`Batch ${batchIndex + 1} completed. Successful Requests: ${successCount}/${BATCH_SIZE}`);
}

async function runLoadTest() {
    console.log(`Starting Load Test: ${NUM_TRANSACTIONS} transactions in batches of ${BATCH_SIZE}...`);
    const numBatches = Math.ceil(NUM_TRANSACTIONS / BATCH_SIZE);

    const startTime = Date.now();

    for (let i = 0; i < numBatches; i++) {
        await sendBatch(i);
        if (i < numBatches - 1) {
            await sleep(DELAY_BETWEEN_BATCHES_MS);
        }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\nLoad test completed in ${duration} seconds.`);
    console.log(`Fetching final metrics...`);

    // Wait for queue processing
    console.log('Waiting 10 seconds for queues to catch up before fetching metrics...');
    await sleep(10000);

    try {
        const metrics = await axios.get(`${API_URL}/admin/metrics`);
        console.log('\nFinal System Metrics:');
        console.log(JSON.stringify(metrics.data, null, 2));
    } catch (err) {
        console.error('Could not fetch metrics:', err.message);
    }
}

runLoadTest();
