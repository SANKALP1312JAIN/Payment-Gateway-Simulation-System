require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Start Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect DB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payment_gateway';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Setup Routes
app.use('/api', require('./routes/api'));

// Start BullMQ workers in the same process
// This fulfills the constraint: "Do NOT rely on a permanently running background worker service."
require('./queue/paymentWorker');
require('./queue/webhookWorker');
console.log('BullMQ Workers successfully initialized in main process');

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
