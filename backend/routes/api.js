const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Creation endpoint (simulating payment orchestrator ingress)
router.post('/payments', paymentController.createPayment);

// Listing / Filter
router.get('/payments', paymentController.listTransactions);

// Manual retry from UI
router.post('/payments/:id/retry', paymentController.retryPayment);

// Metrics dashboard
router.get('/admin/metrics', paymentController.getMetrics);

module.exports = router;
