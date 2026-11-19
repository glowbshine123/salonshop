import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { settingsAPI } from '../../services/apiService';

const WhatsAppBubble = () => {
    const location = useLocation();
    const { isLoading } = useLoading();
    const [phone, setPhone] = React.useState("919876543210");

    // Visibility Logic
    const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/agent-dashboard');
    const hasShownLoader = sessionStorage.getItem('hasShownLoader');
    const isInitialLoading = location.pathname === '/' && !hasShownLoader && isLoading;

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await settingsAPI.getSystemSettings();
                if (settings?.supportPhone) {
                    // Clean phone number (remove +, spaces, etc. for wa.me)
                    const cleanPhone = settings.supportPhone.replace(/\D/g, '');
                    setPhone(cleanPhone);
                }
            } catch (err) {
                console.error("Failed to fetch support phone:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleWhatsApp = () => {
        let message = "Hi, I have a query regarding your products and services on Glow B Shine.";

        // Context-aware message for product pages
        if (location.pathname.startsWith('/products/')) {
            const productTitle = document.querySelector('h1')?.innerText;
            if (productTitle) {
                message = `Hi, I’d like to enquire about your salon services/products on Glow B Shine.`;
            }
        }

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/91${phone}?text=${encodedMessage}`;
        window.open(url, "_blank");
    };

    // Don't show on dashboards or during initial page loader
    if (isDashboard || isInitialLoading) return null;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 z-9999"
        >
            <button
                onClick={handleWhatsApp}
                className="bg-[#25D366] text-white p-2 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#128C7E] transition-colors duration-300 group relative cursor-pointer"
                aria-label="WhatsApp Inquiry"
            >
                <img
                    src="/icons/whatsapp.png"
                    alt="WhatsApp"
                    className="w-10 h-10 object-contain"
                />
            </button>
        </motion.div>
    );
};

export default WhatsAppBubble;
