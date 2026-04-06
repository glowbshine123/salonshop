import React, { useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { Target, Award, Clock, Users, ShieldCheck, Heart, ChevronRight, Truck, BadgeCheck, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const WhyChooseUsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const reasons = [
        {
            icon: <Truck className="text-primary" size={24} />,
            title: "Direct Supply",
            description: "Salon and beauty parlour products delivered directly to professionals, reducing unnecessary middlemen."
        },
        {
            icon: <IndianRupee className="text-primary" size={24} />,
            title: "Better Pricing",
            description: "By reducing the traditional distributor chain, professionals can get better and more affordable prices."
        },
        {
            icon: <Clock className="text-primary" size={24} />,
            title: "Easy Ordering",
            description: "Order products easily without traveling long distances to purchase salon supplies."
        },
        {
            icon: <BadgeCheck className="text-primary" size={24} />,
            title: "For Professionals Only",
            description: "Products are supplied specifically for salon and beauty parlour professionals, not for general retail customers."
        },
        {
            icon: <Award className="text-primary" size={24} />,
            title: "Industry Experience",
            description: "With 7–8 years of experience in the salon product industry, we understand the real needs of professionals."
        },
        {
            icon: <Heart className="text-primary" size={24} />,
            title: "Respect for the Profession",
            description: "We believe salon and beauty parlour work is a profession, and professionals deserve proper support and recognition."
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            <SEO 
                title="Why Choose Us" 
                description="Discover why salon professionals trust Glow B Shine for premium products, direct supply, and unbeatable professional support."
            />
            {/* Header / Hero Section */}
            <div className="relative py-24 overflow-hidden bg-white text-white">
                <div className="absolute inset-0 z-0 opacity-25">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/30">
                            <Target size={16} />
                            <span>Why Choose Us</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none text-neutral-900">
                            Why Choose <span className="text-primary">Glow B Shine.</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Empowering Salon Professionals with Quality, Respect, and Accessibility.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left Column (1/4) - Quick Navigation / Info */}
                    <div className="hidden lg:block lg:w-1/4 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight leading-none">
                                Our <br /> <span className="text-primary">Promise.</span>
                            </h2>
                            <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                                Built to solve the real challenges faced by beauty professionals.
                            </p>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Our Focus</h4>
                            <p className="text-neutral-500 text-sm font-bold">Professionals First.</p>
                            <div className="h-px bg-neutral-200" />
                            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                We bypass middlemen to bring you direct value and unmatched service.
                            </p>
                        </div>
                    </div>

                    {/* Right Column (3/4) - Reasons Grid */}
                    <div className="lg:w-3/4 space-y-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reasons.map((reason, index) => (
                                <div key={index} className="p-8 bg-background-secondary rounded-2xl border border-border space-y-4 group hover:shadow-xl transition-all duration-300">
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        {reason.icon}
                                    </div>
                                    <h4 className="text-xl font-black text-neutral-900 uppercase tracking-tight">{reason.title}</h4>
                                    <p className="text-foreground/80 font-semibold tracking-wide text-base leading-relaxed">
                                        {reason.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Professional Support Banner */}
                        <div className="p-6 bg-foreground text-background rounded-xl relative overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <ShieldCheck className="text-primary" size={48} />
                                <h3 className="text-3xl font-black uppercase tracking-tight">Professional Support & Recognition</h3>
                                <p className="text-neutral-400 font-medium max-w-2xl text-lg leading-relaxed">
                                    Glow B Shine provides affordable, reliable, and professional products so that you can work better and serve your customers with confidence.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                    <Button asChild className="h-14 px-12 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl border-none">
                                        <Link to="/auth/signup">Get Started</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-14 px-12 rounded-lg border-2 border-primary bg-transparent text-white hover:bg-primary/10 font-black text-xs uppercase tracking-[0.2em] transition-all">
                                        <Link to="/products">Browse Catalog</Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyChooseUsPage;
