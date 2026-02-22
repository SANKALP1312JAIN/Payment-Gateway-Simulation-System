const Redis = require('ioredis');

// Default connect to Upstash via URI or fallback local
const redisUri = process.env.REDIS_URI || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
const redis = new Redis(redisUri, {
    tls: redisUri.startsWith('rediss') ? { rejectUnauthorized: false } : undefined // Handle Upstash TLS
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
