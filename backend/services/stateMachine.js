const Transaction = require('../models/Transaction');

/**
 * Validates and performs state transitions using atomic findOneAndUpdate.
 * Required transitions:
 * CREATED -> PROCESSING
 * PROCESSING -> SUCCESS | FAILED
 * FAILED -> RETRYING
 * RETRYING -> SUCCESS | FAILED
 * 
 * @param {string} transactionId 
 * @param {string} expectedCurrentState 
 * @param {string} newState 
 * @param {object} updateFields Additional fields to update (e.g., gatewayResponse)
 * @returns {Promise<object>} The updated transaction or null if transition invalid
 */
async function transitionState(transactionId, expectedCurrentState, newState, updateFields = {}) {
    // Define allowed transitions
    const allowedTransitions = {
        'CREATED': ['PROCESSING'],
        'PROCESSING': ['SUCCESS', 'FAILED'],
        'FAILED': ['RETRYING'],
        'RETRYING': ['SUCCESS', 'FAILED']
    };

    if (!allowedTransitions[expectedCurrentState]?.includes(newState)) {
        throw new Error(`Invalid state transition from ${expectedCurrentState} to ${newState}`);
    }

    // Atomic update: only updates if document is in expectedCurrentState
    const updatedTransaction = await Transaction.findOneAndUpdate(
        { _id: transactionId, status: expectedCurrentState },
        { $set: { status: newState, ...updateFields } },
        { new: true } // Return updated document
    );

    if (!updatedTransaction) {
        throw new Error(`State transition failed: Transaction ${transactionId} not found or not in ${expectedCurrentState} state.`);
    }

    return updatedTransaction;
}

module.exports = {
    transitionState
};
