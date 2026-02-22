import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import MetricsCards from './MetricsCards';
import TransactionList from './TransactionList';
import CreatePaymentModal from './CreatePaymentModal';
import { Activity, Plus, RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const res = await api.getMetrics();
            setMetrics(res.data);
        } catch (err) {
            console.error('Failed to fetch metrics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000); // Poll every 5s for live feel
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Activity className="text-primary w-8 h-8" />
                        System Overview
                    </h1>
                    <p className="text-textMuted mt-1">Real-time gateway simulation telemetry</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={fetchMetrics}
                        className="p-2.5 rounded-xl border border-surface bg-surface hover:bg-surface/80 transition-colors text-textMuted hover:text-white"
                        title="Refresh Metrics"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        New Payment
                    </button>
                </div>
            </div>

            {!loading && metrics && (
                <MetricsCards metrics={metrics} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-[#111111] border border-surface rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <TransactionList key={metrics?.totalTransactions} />
                </div>
            </div>

            <CreatePaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchMetrics();
                }}
            />
        </div>
    );
};

export default Dashboard;
