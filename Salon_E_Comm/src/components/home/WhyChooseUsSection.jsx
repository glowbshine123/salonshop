import React from 'react';
import { Truck, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefitCards = [
    {
        title: '100% NATURAL EXTRACT',
        description: 'Made using natural extracts',
        icon: '/benifits/benifits1.png',
        bg: '/bg/b4.png',
    },
    {
        title: 'SLES & PAraben FREE',
        description: 'Proven Safe and Effective',
        icon: '/benifits/benifits2.png',
        bg: '/bg/b4.png',
    },
    {
        title: 'SECURE PAYMENTS',
        description: '100% Secure Checkout',
        icon: '/benifits/benifits3.png',
        bg: '/bg/b4.png',
    },
];

export default function WhyChooseUsSection() {
    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stylized Title */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="hidden sm:block h-px flex-1 bg-neutral-200" />
                    <div className="flex items-center gap-2">
                        <span className="text-pink-300">◆</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 whitespace-nowrap">
                            Why Choose US
                        </h2>
                        <span className="text-pink-300">◆</span>
                    </div>
                    <div className="hidden sm:block h-px flex-1 bg-neutral-200" />
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {benefitCards.map((card, index) => (
                        <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border border-border shadow-sm flex flex-col items-center min-h-fit justify-center text-center"
                            style={{
                                backgroundImage: `url("${card.bg}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            {/* Overlay for better readability */}
                            <div className="absolute inset-0 bg-white/10 transition-colors duration-500" />

                            <div className="relative z-10 space-y-0">
                                <div className="w-42 h-42 mx-auto transform group-hover:scale-110 transition-transform duration-500">
                                    <img
                                        src={card.icon}
                                        alt={card.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="space-y-1 mb-4 ">
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {card.title}
                                    </h3>
                                    <div className="h-px w-12 bg-neutral-200 mx-auto" />
                                    <p className="text-neutral-600 font-medium">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Explore More Link */}
                <div className="mt-12 text-center">
                    <Link
                        to="/why-choose-us"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Explore More Reasons <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
