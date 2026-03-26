import React, { useState } from 'react';
import { X, Loader2, Link, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const CreatePaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        amount: '',
        paymentMethod: 'CARD',
    });
    const [mockDetails, setMockDetails] = useState({
        cardNumber: '', expiry: '', cvc: '',
        upiId: '', phone: '', provider: 'PAYTM'
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-borderLight rounded-2xl w-full max-w-md shadow-stripe-modal relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400"></div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-textMain">Create Payment</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-textMain transition-colors">
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
                            <label className="block text-sm font-medium text-textMain mb-1.5">User ID</label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                className="w-full bg-white border border-borderLight rounded-xl px-4 py-2.5 text-textMain placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1.5">Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-white border border-borderLight rounded-xl pl-8 pr-4 py-2.5 text-textMain placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textMain mb-1.5">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100 mb-4">
                                {['CARD', 'UPI', 'WALLET'].map(method => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                        className={`py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${formData.paymentMethod === method
                                            ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200'
                                            : 'text-gray-500 hover:text-textMain'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DYNAMIC FIELDS TO SIMULATE REAL CHECKOUT */}
                        <div className="p-4 bg-gray-50 border border-borderLight rounded-xl space-y-4 shadow-inner">
                            {formData.paymentMethod === 'CARD' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Card Information</label>
                                        <input
                                            type="text"
                                            placeholder="4242 4242 4242 4242"
                                            maxLength="19"
                                            value={mockDetails.cardNumber}
                                            onChange={(e) => setMockDetails({ ...mockDetails, cardNumber: e.target.value })}
                                            className="w-full bg-white border border-borderLight rounded-t-xl px-4 py-2.5 text-textMain placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                                        />
                                        <div className="flex -mt-px">
                                            <input
                                                type="text"
                                                placeholder="MM / YY"
                                                maxLength="5"
                                                value={mockDetails.expiry}
                                                onChange={(e) => setMockDetails({ ...mockDetails, expiry: e.target.value })}
                                                className="w-1/2 bg-white border border-borderLight rounded-bl-xl px-4 py-2.5 text-textMain placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="CVC"
                                                maxLength="4"
                                                value={mockDetails.cvc}
                                                onChange={(e) => setMockDetails({ ...mockDetails, cvc: e.target.value })}
                                                className="w-1/2 bg-white border border-borderLight border-l-0 rounded-br-xl px-4 py-2.5 text-textMain placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.paymentMethod === 'UPI' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">UPI ID / VPA</label>
                                    <input
                                        type="text"
                                        placeholder="username@okicici"
                                        value={mockDetails.upiId}
                                        onChange={(e) => setMockDetails({ ...mockDetails, upiId: e.target.value })}
                                        className="w-full bg-white border border-borderLight rounded-xl px-4 py-2.5 text-textMain placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">A payment request will be mocked to this UPI ID.</p>
                                </div>
                            )}

                            {formData.paymentMethod === 'WALLET' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Wallet Provider</label>
                                        <select
                                            value={mockDetails.provider}
                                            onChange={(e) => setMockDetails({ ...mockDetails, provider: e.target.value })}
                                            className="w-full bg-white border border-borderLight rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                                        >
                                            <option value="PAYTM">Paytm</option>
                                            <option value="PHONEPE">PhonePe</option>
                                            <option value="AMAZON">Amazon Pay</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5">Linked Mobile Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={mockDetails.phone}
                                            onChange={(e) => setMockDetails({ ...mockDetails, phone: e.target.value })}
                                            className="w-full bg-white border border-borderLight rounded-xl px-4 py-2.5 text-textMain placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-borderLight bg-white hover:bg-gray-50 text-textMain transition-colors font-medium shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-medium transition-all shadow-stripe hover:shadow-stripe-hover disabled:opacity-50"
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
