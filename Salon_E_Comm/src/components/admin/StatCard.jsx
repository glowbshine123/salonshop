import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-600',
        emerald: 'bg-emerald-600',
        amber: 'bg-amber-600',
        rose: 'bg-rose-600',
        neutral: 'bg-neutral-900',
        primary: 'bg-primary'
    };

    const bgClasses = {
        blue: 'bg-blue-50',
        emerald: 'bg-emerald-50',
        amber: 'bg-amber-50',
        rose: 'bg-rose-50',
        neutral: 'bg-neutral-50',
        primary: 'bg-bg-secondary'
    };

    const iconColorClasses = {
        blue: 'text-blue-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        rose: 'text-rose-600',
        neutral: 'text-neutral-900',
        primary: 'text-primary'
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100 group flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300">
            <div className={`p-4 rounded-xl ${bgClasses[color]} ${iconColorClasses[color]} border border-transparent group-hover:border-current shadow-sm transition-all duration-500 shrink-0 inline-flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-none">{title}</p>
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-wide leading-none truncate">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trendValue}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
