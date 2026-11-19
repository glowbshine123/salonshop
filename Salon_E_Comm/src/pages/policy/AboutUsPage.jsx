import React, { useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { Info, Target, Eye, Award, Clock, Users, ShieldCheck, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AboutUsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: <Clock className="text-primary" size={24} />,
            title: "Time Saving",
            description: "No more long travels to buy supplies. We deliver directly to your salon doorstep."
        },
        {
            icon: <Award className="text-primary" size={24} />,
            title: "Premium Quality",
            description: "Access to professional-grade products from trusted brands you can rely on."
        },
        {
            icon: <Users className="text-primary" size={24} />,
            title: "Expertise",
            description: "With over 7-8 years of experience, we understand your unique professional needs."
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            <SEO 
                title="About Us" 
                description="Learn about Glow B Shine's mission to support salon and beauty parlour professionals with premium products delivered to their doorstep."
            />
            {/* Header / Hero Section */}
            <div className="relative py-24 overflow-hidden bg-white text-white">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/30">
                            <Info size={16} />
                            <span>Know Our Story</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none text-neutral-900">
                            About <span className="text-primary">Glow B Shine.</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Bringing Professional Salon & Beauty Parlour Products Directly To Your Doorstep.
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
                                Serving <br /> <span className="text-primary">Professionals.</span>
                            </h2>
                            <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                                Elevating the salon profession through quality and accessibility.
                            </p>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Our Experience</h4>
                            <p className="text-neutral-500 text-sm font-bold">7-8+ Years in Industry.</p>
                            <div className="h-px bg-neutral-200" />
                            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                We exclusively serve salon and beauty parlour professionals, not general retail customers.
                            </p>
                        </div>
                    </div>

                    {/* Right Column (3/4) - Detailed Content */}
                    <div className="lg:w-3/4 space-y-20">
                        {/* Who we are */}
                        <div className="space-y-6">
                            <h3 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">Our Story</h3>
                            <div className="prose prose-neutral max-w-none text-neutral-500 font-medium text-lg leading-relaxed space-y-6">
                                <p>
                                    Glow B Shine was created to support salon and beauty parlour professionals by making professional salon and beauty products easily available at their doorstep.
                                </p>
                                <p>
                                    We believe that salon and beauty parlour work is not just a business — it is a profession. Just like doctors, pharmacists, and teachers are respected in society, salon and beauty professionals also deserve the same respect and recognition for their skills and services.
                                </p>
                                <p>
                                    Many salon and beauty parlour owners get only one holiday in a week, and even on that day they often have to travel 50–90 kilometers to purchase professional products. Glow B Shine was built to solve this problem by delivering quality salon and beauty parlour products directly to professional shops.
                                </p>
                            </div>
                        </div>

                        {/* Mission & Vision Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-4 bg-background-secondary rounded-xl border border-border space-y-2 group">
                                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Target size={32} />
                                </div>
                                <h4 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Our Mission</h4>
                                <p className="text-foreground/80 font-semibold tracking-wide text-base leading-relaxed">
                                    To make professional salon and beauty parlour products easily accessible by delivering quality products directly to professionals at better prices.
                                </p>
                            </div>
                            <div className="p-4 bg-background-secondary rounded-xl border border-border space-y-2 group">
                                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Eye size={32} />
                                </div>
                                <h4 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Our Vision</h4>
                                <p className="text-foreground/80 font-semibold tracking-wide text-base leading-relaxed">
                                    To build a platform where salon and beauty professionals receive the respect they deserve as a profession and have easy access to reliable and affordable professional products.
                                </p>
                            </div>
                        </div>

                        {/* Why Choose Us */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4">Why Partner With Us?</h3>
                                <div className="w-20 h-1 bg-primary mx-auto mb-8" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex flex-col items-center text-center space-y-4">
                                        <div className="mb-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                            {feature.icon}
                                        </div>
                                        <h5 className="text-lg font-bold text-neutral-900 uppercase tracking-tight">{feature.title}</h5>
                                        <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <Link to="/why-choose-us" className="flex items-center text-base font-semibold w-fit mx-auto">
                                Learn more about our value proposition <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Professional Ethics */}
                        <div className="mt-16 bg-neutral-900 rounded-xl p-6 md:p-10 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Heart className="text-primary" size={32} />
                                        <h3 className="text-3xl font-black uppercase tracking-tight">Respecting the Profession</h3>
                                    </div>
                                    <p className="text-neutral-400 font-medium max-w-2xl text-lg leading-relaxed">
                                        Our platform supplies products specifically for salon and beauty parlour professionals and not for general retail customers. This helps professionals maintain their service value and offer better results to their clients.
                                    </p>
                                </div>
                                <Button asChild className="shrink-0 h-14 px-12 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl border-none">
                                    <Link to="/auth/signup">Join as a Professional</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
