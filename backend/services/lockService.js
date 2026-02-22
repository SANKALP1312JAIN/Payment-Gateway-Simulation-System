const redis = require('../config/redis');

/**
 * Attempts to acquire a lock for a given resource with NX (Set if Not eXists) 
 * and PX (Expire in milliseconds).
 * 
 * @param {string} key Lock key identifier
 * @param {number} ttl Time to live in milliseconds
 * @returns {Promise<boolean>} true if lock acquired successfully
 */
async function acquireLock(key, ttl = 30000) {
    // SET <key> true NX PX <ttl>
    const result = await redis.set(key, 'true', 'NX', 'PX', ttl);
    return result === 'OK';
}

/**
 * Releases a previously acquired lock.
 * 
 * @param {string} key Lock key identifier
 */
async function releaseLock(key) {
    await redis.del(key);
}

module.exports = {
    acquireLock,
    releaseLock
};
