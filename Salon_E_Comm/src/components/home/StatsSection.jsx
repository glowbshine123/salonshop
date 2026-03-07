import React from 'react';
import DotGrid from '../ui/dot-grid';

const StatsSection = () => (
    <section className="py-24 border-y border-neutral-100 bg-white relative overflow-hidden">
        <DotGrid
            baseColor="#D4D4D4"
            gap={20}
            dotSize={2}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 text-center divide-x divide-emerald-500/10">
                {[
                    { value: "500+", label: "Products" },
                    { value: "300+", label: "Agents" },
                    { value: "1200+", label: "Salons" },
                    { value: "₹10L+", label: "Monthly Orders" }
                ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                        <h3 className="text-5xl md:text-6xl font-black text-primary tracking-tighter">{stat.value}</h3>
                        <p className="text-foreground font-bold uppercase tracking-widest text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default StatsSection;
