import React from 'react';
import { CreditCard, CheckCircle2, XCircle, BarChart3, RotateCcw } from 'lucide-react';

const MetricCard = ({ title, value, icon, trend, borderClass }) => (
    <div className={`bg-surface border border-borderLight shadow-sm rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group transition-all hover:shadow-stripe ${borderClass}`}>
        <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            {React.cloneElement(icon, { className: "w-32 h-32 text-primary" })}
        </div>

        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                {React.cloneElement(icon, { className: "w-5 h-5 text-gray-500" })}
            </div>
            <h3 className="text-textMuted font-medium text-sm tracking-wide uppercase">{title}</h3>
        </div>

        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-textMain tracking-tight">{value}</span>
            {trend && <span className="text-xs text-textMuted border border-borderLight rounded-full px-2 py-0.5 bg-gray-50">{trend}</span>}
        </div>
    </div>
);

const MetricsCards = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
                title="Total Volume"
                value={metrics.totalTransactions.toLocaleString()}
                icon={<BarChart3 />}
                borderClass="hover:border-primary/50"
            />
            <MetricCard
                title="Success Rate"
                value={metrics.successRate}
                icon={<CheckCircle2 className="text-success" />}
                borderClass="hover:border-success/50"
            />
            <MetricCard
                title="Failure Rate"
                value={metrics.failureRate}
                icon={<XCircle className="text-danger" />}
                borderClass="hover:border-danger/50"
            />
            <MetricCard
                title="Avg Retries"
                value={metrics.avgRetryCount}
                icon={<RotateCcw className="text-warning" />}
                borderClass="hover:border-warning/50"
            />
        </div>
    );
};

export default MetricsCards;
