import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';

const faqs = [
    {
        "question": "What kind of products do you sell?",
        "answer": "We offer a wide range of salon and beauty products including hair care, skincare, grooming essentials, and professional salon-quality products."
    },
    {
        "question": "Are the products authentic?",
        "answer": "Yes, all our products are 100% authentic and sourced directly from trusted brands and authorized distributors."
    },
    {
        "question": "How can I place an order?",
        "answer": "Simply browse the products, add your desired items to the cart, and proceed to checkout to complete your purchase."
    },
    {
        "question": "What payment methods are accepted?",
        "answer": "We support multiple payment methods including UPI, debit cards, credit cards, and other secure online payment options."
    },
    {
        "question": "How long does delivery take?",
        "answer": "Delivery times may vary depending on your location, but most orders are delivered within 3–7 business days."
    },
    {
        "question": "Can I track my order?",
        "answer": "Yes, once your order is shipped, you will receive tracking details so you can monitor your delivery status."
    },
    {
        "question": "Can I return or exchange a product?",
        "answer": "Yes, returns or exchanges are accepted for eligible products within the return window, provided the items are unused and in their original packaging."
    },
    {
        "question": "What should I do if I receive a damaged product?",
        "answer": "If you receive a damaged or defective product, please contact our support team with photos of the product and packaging so we can assist you with a replacement or refund."
    },
    {
        "question": "Do you offer discounts or promotions?",
        "answer": "Yes, we regularly offer discounts, seasonal sales, and promotional offers on selected products."
    },
    {
        "question": "Do I need an account to place an order?",
        "answer": "Creating an account helps you track orders, manage your addresses, and receive updates about new products and offers."
    }
];

const FAQItem = ({ faq, isOpen, onClick }) => {
    return (
        <div className="border-b border-neutral-100 last:border-0 hover:bg-primary-muted/20 px-2">
            <button
                onClick={onClick}
                className="w-full py-3 flex items-center justify-between gap-4 text-left group "
            >
                <span className="text-base md:text-lg font-semibold text-foreground-secondary group-hover:text-primary transition-colors">
                    {faq.question}
                </span>
                <ChevronDown
                    size={20}
                    className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-5' : 'max-h-0'}`}
            >
                <p className="text-neutral-500 leading-relaxed max-w-2xl">
                    {faq.answer}
                </p>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="py-6 bg-white" id='faq'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-24">
                    {/* Heading and Description - Right Side (1/4) */}
                    <div className="lg:w-1/4 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            <MessageCircle size={14} />
                            <span>Questions?</span>
                        </div>
                        <h2 className="text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                            Frequently Asked <span className="text-primary">Questions.</span>
                        </h2>
                        <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                            Find answers to common questions about our products, delivery, and services.
                        </p>
                        <div className="pt-4 border-t border-neutral-100">
                            <p className="text-sm text-neutral-400 font-medium mb-4">
                                If your question doesn't cover here then contact the team.
                            </p>
                        </div>
                    </div>

                    {/* FAQ Accordion - Left Side (3/4) */}
                    <div className="lg:w-3/4">
                        <div className="divide-y divide-neutral-100">
                            {faqs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    faq={faq}
                                    isOpen={openIndex === index}
                                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
