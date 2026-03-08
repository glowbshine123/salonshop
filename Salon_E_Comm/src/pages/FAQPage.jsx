import React, { useEffect } from 'react';
import FAQSection from '../components/home/FAQSection';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FAQPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">

            {/* Hero / Header Section */}
            <div className="relative py-20 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                        <HelpCircle size={14} />
                        <span>Support & Help</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter uppercase leading-none mb-6">
                        Help <span className="text-primary">Center.</span>
                    </h1>
                    <p className="text-neutral-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Everything you need to know about our products, shipping, and professional salon services.
                    </p>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left Sidebar - Policy Navigation (1/4) */}
                    <div className="lg:w-1/4 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight leading-none">
                                Support <br /> <span className="text-primary">Directory.</span>
                            </h2>
                            <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                                Find quick answers and detailed policies for our salon partners.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link to="/terms" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Terms & Conditions</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/privacy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Privacy Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/shipping-policy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Shipping Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/reward-policy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Reward Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                        </div>

                        <div className="p-6 bg-neutral-900 rounded-3xl text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl -translate-y-1/2" />
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-lg font-black uppercase tracking-tight">Still need help?</h4>
                                <p className="text-neutral-400 text-xs font-medium leading-relaxed">
                                    Our professional support team is dedicated to your salon's success.
                                </p>
                                <Button className="w-full h-10 bg-primary hover:bg-primary-hover text-foreground-secondary font-black uppercase tracking-widest rounded-lg transition-all border-none">
                                    Live Support
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - FAQ Accordions (3/4) */}
                    <div className="lg:w-3/4">
                        <FAQSection />
                    </div>
                </div>
            </div>

            {/* Contact CTA */}
            <div className="max-w-3xl mx-auto px-4 mt-20 text-center space-y-8">
                <div className="h-px w-24 bg-primary/20 mx-auto" />
                <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Still have questions?</h3>
                <p className="text-neutral-500 font-medium">
                    If you couldn't find the answer you were looking for, our professional support team is ready to assist you.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild className="h-14 px-12 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl border-none">
                        <Link to="/contact">Contact Support</Link>
                    </Button>
                    <Button variant="outline" className="h-14 px-12 rounded-lg border-2 border-primary bg-transparent text-foreground-secondary hover:bg-primary-hover font-black text-xs uppercase tracking-[0.2em] transition-all">
                        WhatsApp Us
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
