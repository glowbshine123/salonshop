import React, { useState, useEffect } from 'react';
import DotGrid from '../ui/dot-grid';
import { statsAPI } from '../../services/apiService';

const StatsSection = () => {
    const [stats, setStats] = useState({
        products: 0,
        agents: 0,
        salons: 0,
        orders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statsAPI.getPublicStats();
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCount = (value) => {
        if (value === 0) return "0+";
        if (value < 10) return `${value}+`;
        
        let roundedValue = value;
        if (value < 100) {
            roundedValue = Math.floor(value / 10) * 10;
        } else if (value < 500) {
            roundedValue = Math.floor(value / 100) * 100;
        } else if (value < 1000) {
            roundedValue = Math.floor(value / 500) * 500;
        } else if (value < 100000) {
            roundedValue = Math.floor(value / 1000) * 1000;
        } else if (value < 10000000) { // Less than 1 Crore
            roundedValue = Math.floor(value / 100000) * 100000;
        } else {
            roundedValue = Math.floor(value / 10000000) * 10000000;
        }

        // Final formatting with K/L/Cr
        if (roundedValue >= 10000000) return `${roundedValue / 10000000}Cr+`;
        if (roundedValue >= 100000) return `${roundedValue / 100000}L+`;
        if (roundedValue >= 1000) return `${roundedValue / 1000}K+`;
        
        return `${roundedValue}+`;
    };

    const statItems = [
        { value: formatCount(stats.products), label: "Products" },
        { value: formatCount(stats.agents), label: "Agents" },
        { value: formatCount(stats.salons), label: "Salons" },
        { value: formatCount(stats.orders), label: "Orders" }
    ];

    return (
        <section className="py-24 border-y border-neutral-100 bg-white relative overflow-hidden">
            <DotGrid
                baseColor="#D4D4D4"
                gap={20}
                dotSize={2}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 text-center divide-x divide-emerald-500/10">
                    {statItems.map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <h3 className="text-5xl md:text-6xl font-black text-primary tracking-tighter">
                                {loading ? "..." : stat.value}
                            </h3>
                            <p className="text-foreground font-bold uppercase tracking-widest text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
