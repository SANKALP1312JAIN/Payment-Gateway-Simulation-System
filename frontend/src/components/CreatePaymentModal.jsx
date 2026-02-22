import React, { useState } from 'react';
import { X, Loader2, Link, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const CreatePaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        amount: '',
        paymentMethod: 'CARD',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const idempotencyKey = crypto.randomUUID();
            await api.createPayment(
                { ...formData, amount: parseFloat(formData.amount) },
                { 'Idempotency-Key': idempotencyKey }
            );
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#111111] border border-surface rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400"></div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Create Payment</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-textMuted hover:bg-surface hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm flex gap-2 items-center">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">User ID</label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-background border border-surface rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-1.5">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['CARD', 'UPI', 'WALLET'].map(method => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                        className={`py-2 rounded-xl text-sm font-medium border transition-all ${formData.paymentMethod === method
                                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                            : 'bg-background border-surface text-textMuted hover:bg-surface/50'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-surface text-textMuted hover:bg-surface hover:text-white transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link className="w-5 h-5" />}
                                {loading ? 'Processing' : 'Process'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePaymentModal;
