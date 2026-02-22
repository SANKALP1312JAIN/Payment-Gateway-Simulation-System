import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Clock, MoreHorizontal } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        CREATED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        PROCESSING: 'bg-primary/10 text-primary border-primary/20 animate-pulse',
        SUCCESS: 'bg-success/10 text-success border-success/20',
        FAILED: 'bg-danger/10 text-danger border-danger/20',
        RETRYING: 'bg-warning/10 text-warning border-warning/20',
    };

    const icons = {
        CREATED: <Clock className="w-3.5 h-3.5" />,
        PROCESSING: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        SUCCESS: <CheckCircle2 className="w-3.5 h-3.5" />,
        FAILED: <AlertCircle className="w-3.5 h-3.5" />,
        RETRYING: <RotateCcw className="w-3.5 h-3.5 animate-spin" />,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            {icons[status]}
            {status}
        </span>
    );
};

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [retryingIds, setRetryingIds] = useState(new Set());

    const fetchTransactions = async () => {
        try {
            const res = await api.getTransactions({ limit: 10 });
            setTransactions(res.data.transactions);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleRetry = async (id) => {
        try {
            setRetryingIds(prev => new Set(prev).add(id));
            await api.retryPayment(id);
            await fetchTransactions();
        } catch (err) {
            console.error(err);
            alert('Failed to retry payment');
        } finally {
            setRetryingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center text-textMuted"><Loader2 className="w-6 h-6 animate-spin" /></div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                <span className="text-sm border border-surface bg-surface text-textMuted px-3 py-1 rounded-full">Live feed</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-surface bg-black/50">
                <table className="w-full text-sm text-left relative">
                    <thead className="text-xs text-textMuted uppercase bg-surface/50 border-b border-surface">
                        <tr>
                            <th className="px-6 py-4 font-medium">TxID / Date</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Method</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-center">Retries</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface">
                        {transactions.map((tx) => (
                            <tr key={tx._id} className="hover:bg-surface/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs text-gray-300 mb-1">{tx._id.slice(-8).toUpperCase()}</div>
                                    <div className="text-xs text-textMuted">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-medium text-white">${tx.amount.toFixed(2)}</span>
                                    <span className="text-textMuted text-xs ml-1">{tx.currency}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-surface text-gray-300 px-2 py-1 rounded-md text-xs font-medium border border-white/5">{tx.paymentMethod}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={tx.status} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-1">
                                        <span className="text-textMuted font-mono text-xs bg-surface/80 px-2 py-0.5 rounded border border-white/5">{tx.retryCount}/{tx.maxRetries}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {tx.status === 'FAILED' ? (
                                        <button
                                            onClick={() => handleRetry(tx._id)}
                                            disabled={retryingIds.has(tx._id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-surface hover:bg-surface/80 border border-white/10 transition-colors disabled:opacity-50"
                                        >
                                            {retryingIds.has(tx._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                            <span>Retry</span>
                                        </button>
                                    ) : (
                                        <button className="p-1.5 text-textMuted border border-transparent rounded hover:border-surface hover:bg-surface disabled:opacity-50" disabled>
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-textMuted">No transactions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionList;
