import React, { useEffect } from 'react';
import FAQSection from '../../components/home/FAQSection';
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
                <div className="absolute inset-0 z-0 opacity-25">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    <FAQSection />
                </div>
            </div>

            {/* Contact CTA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-24">
                <div className="bg-background-secondary rounded-xl p-4 md:p-6 border border-soft relative overflow-hidden group shadow-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-black text-neutral-900 uppercase">Still have questions?</h3>
                            <p className="text-neutral-500 font-medium max-w-xl text-sm leading-relaxed">
                                Our professional support team is dedicated to your salon's success. If you can't find what you're looking for, we're just a message away.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/contact">
                                <Button className="h-12 px-10 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 whitespace-nowrap border-none transition-all">
                                    Contact Support
                                </Button>
                            </Link>
                            <Button variant="outline" className="h-12 px-10 rounded-lg border-2 border-primary bg-transparent text-foreground-secondary hover:bg-primary/5 font-black text-xs uppercase tracking-widest transition-all">
                                WhatsApp Us
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
