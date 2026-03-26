import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Clock, MoreHorizontal } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        CREATED: 'bg-gray-100 text-gray-600 border-gray-200',
        PROCESSING: 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse',
        SUCCESS: 'bg-successBg text-success border-green-200',
        FAILED: 'bg-dangerBg text-danger border-red-200',
        RETRYING: 'bg-warningBg text-warning border-yellow-200',
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
                <h2 className="text-xl font-semibold text-textMain">Recent Transactions</h2>
                <span className="text-sm border border-borderLight bg-gray-50 text-textMuted px-3 py-1 rounded-full shadow-sm">Live feed</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-borderLight bg-white shadow-sm">
                <table className="w-full text-sm text-left relative">
                    <thead className="text-xs text-textMuted uppercase bg-gray-50 border-b border-borderLight">
                        <tr>
                            <th className="px-6 py-4 font-medium tracking-wider">TxID / Date</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Method</th>
                            <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                            <th className="px-6 py-4 font-medium text-center tracking-wider">Retries</th>
                            <th className="px-6 py-4 font-medium text-right tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-borderLight">
                        {transactions.map((tx) => (
                            <tr key={tx._id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs text-textMain font-medium mb-1">{tx._id.slice(-8).toUpperCase()}</div>
                                    <div className="text-xs text-textMuted">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-semibold text-textMain">${tx.amount.toFixed(2)}</span>
                                    <span className="text-textMuted text-xs ml-1 font-medium">{tx.currency}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200">{tx.paymentMethod}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={tx.status} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-1">
                                        <span className="text-textMuted font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{tx.retryCount}/{tx.maxRetries}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {tx.status === 'FAILED' ? (
                                        <button
                                            onClick={() => handleRetry(tx._id)}
                                            disabled={retryingIds.has(tx._id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-textMain bg-white hover:bg-gray-50 border border-borderLight shadow-sm transition-all disabled:opacity-50"
                                        >
                                            {retryingIds.has(tx._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                            <span>Retry</span>
                                        </button>
                                    ) : (
                                        <button className="p-1.5 text-gray-400 border border-transparent rounded hover:border-borderLight hover:bg-gray-50 hover:text-textMain transition-colors disabled:opacity-50" disabled>
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
