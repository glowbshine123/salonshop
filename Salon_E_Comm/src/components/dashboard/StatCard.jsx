import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-600',
        emerald: 'bg-primary',
        pink: 'bg-primary',
        amber: 'bg-amber-600',
        rose: 'bg-rose-600',
        neutral: 'bg-neutral-900',
    };

    const bgClasses = {
        blue: 'bg-blue-50',
        emerald: 'bg-primary/10',
        pink: 'bg-primary/10',
        amber: 'bg-amber-50',
        rose: 'bg-rose-50',
        neutral: 'bg-neutral-50',
    };

    const iconColorClasses = {
        blue: 'text-blue-600',
        emerald: 'text-primary',
        pink: 'text-primary',
        amber: 'text-amber-600',
        rose: 'text-rose-600',
        neutral: 'text-neutral-900',
    };

    return (
        <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-neutral-100 group flex items-center gap-4 transition-all duration-300">
            <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl ${bgClasses[color]} ${iconColorClasses[color]} border border-transparent group-hover:border-current shadow-sm transition-all duration-500 shrink-0 flex items-center justify-center`}>
                <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[10px] lg:text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
                <div className="flex items-center gap-2 lg:gap-3">
                    <h3 className="text-xl lg:text-3xl font-bold text-neutral-900 tracking-tight leading-none truncate">{value}</h3>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${trend === 'up' ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trendValue}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
