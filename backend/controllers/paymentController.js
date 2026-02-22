const Transaction = require('../models/Transaction');
const paymentQueue = require('../queue/paymentQueue');

exports.createPayment = async (req, res) => {
    const { userId, amount, currency, paymentMethod } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
        return res.status(400).json({ error: 'Idempotency-Key header is required' });
    }

    // 1. Basic input validation
    if (!userId || !amount || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 2. Attempt atomic insert
        const tx = await Transaction.create({
            userId,
            amount,
            currency: currency || 'USD',
            paymentMethod,
            idempotencyKey,
            status: 'CREATED'
        });

        // 3. Created successfully -> enqueue processing job
        await paymentQueue.add('processPayment', {
            transactionId: tx._id,
            status: tx.status
        }, {
            // built-in retry options instead of separate retry services
            attempts: tx.maxRetries,
            backoff: { type: 'exponential', delay: 2000 },
            // Important to keep job state clean in Redis
            removeOnComplete: true,
            removeOnFail: 50 // retain recent failures for debugging
        });

        return res.status(201).json({ message: 'Payment created and queued', transaction: tx });
    } catch (error) {
        // 4. If duplicate key error -> fetch existing transaction and return it
        if (error.code === 11000) {
            const existingTx = await Transaction.findOne({ idempotencyKey });
            return res.status(200).json({ message: 'Idempotent request: returning existing transaction', transaction: existingTx });
        }
        console.error('Create Payment Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getMetrics = async (req, res) => {
    try {
        const metrics = await Transaction.aggregate([
            {
                $facet: {
                    stats: [
                        {
                            $group: {
                                _id: null,
                                totalTransactions: { $sum: 1 },
                                avgRetryCount: { $avg: '$retryCount' }
                            }
                        }
                    ],
                    methodDist: [
                        {
                            $group: {
                                _id: '$paymentMethod',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    statusDist: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const facet = metrics[0];
        const totalTransactions = facet.stats[0]?.totalTransactions || 0;
        const avgRetryCount = facet.stats[0]?.avgRetryCount || 0;

        let successCount = 0;
        let failureCount = 0;

        // Calculate rate from statusDist
        const statusMap = {};
        facet.statusDist.forEach(s => {
            statusMap[s._id] = s.count;
            if (s._id === 'SUCCESS') successCount += s.count;
            if (s._id === 'FAILED') failureCount += s.count;
        });

        const successRate = totalTransactions ? ((successCount / totalTransactions) * 100).toFixed(2) : 0;
        const failureRate = totalTransactions ? ((failureCount / totalTransactions) * 100).toFixed(2) : 0;

        // Convert method distributions to a map
        const paymentMethodDistribution = {};
        facet.methodDist.forEach(m => {
            paymentMethodDistribution[m._id] = m.count;
        });

        return res.json({
            totalTransactions,
            successRate: `${successRate}%`,
            failureRate: `${failureRate}%`,
            avgRetryCount: parseFloat(avgRetryCount.toFixed(2)),
            paymentMethodDistribution,
            statusCounts: statusMap
        });
    } catch (error) {
        console.error('Metrics Error:', error);
        return res.status(500).json({ error: 'Internal Server Error fetching metrics' });
    }
};

exports.listTransactions = async (req, res) => {
    try {
        // Basic filtering and pagination
        const { status, limit = 50, page = 1 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(filter);

        res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.retryPayment = async (req, res) => {
    // Manual endpoint to retry a FAILED transaction
    const { id } = req.params;
    try {
        const tx = await Transaction.findById(id);
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });
        if (tx.status !== 'FAILED') {
            return res.status(400).json({ error: 'Only FAILED transactions can be retried' });
        }

        // reset status back to CREATED or RETRYING
        tx.status = 'CREATED';
        tx.retryCount = 0; // Reset retries on manual interaction
        tx.gatewayResponse = null;
        await tx.save();

        // requeue
        await paymentQueue.add('processPayment', {
            transactionId: tx._id,
            status: tx.status
        }, {
            attempts: tx.maxRetries,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true
        });

        res.json({ message: 'Payment queued for manual retry', transaction: tx });
    } catch (e) {
        res.status(500).json({ error: 'Error queuing retry' });
    }
};
