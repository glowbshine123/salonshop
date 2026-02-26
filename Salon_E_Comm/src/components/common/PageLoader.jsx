import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

const PageLoader = () => {
    const { isLoading, progress, isFinished } = useLoading();
    const location = useLocation();

    // Only show on homepage and only once per session
    const hasShownLoader = sessionStorage.getItem('hasShownLoader');
    const shouldShow = location.pathname === '/' && !hasShownLoader;

    useEffect(() => {
        if (isFinished && shouldShow) {
            sessionStorage.setItem('hasShownLoader', 'true');
        }
    }, [isFinished, shouldShow]);

    if (!shouldShow) return null;

    // Note: We use static assets here to ensure the loader shows INSTANTLY
    // without waiting for any API calls (like settings check).

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f9fafb]"
                >
                    <div className="max-w-xs flex flex-col items-center gap-4 px-4">
                        {/* Logo and Name (below loader line) */}
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="relative"
                            >
                                {/* Static "S" Logo for instant render */}
                                <div className="w-12 h-12 bg-green-950 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/10">
                                    <span className="text-white font-black text-3xl">S</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-start gap-0"
                            >
                                <h2 className="text-2xl font-black tracking-tighter text-neutral-800 uppercase">
                                    Salon E-Comm
                                </h2>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                    Professional Inventory
                                </span>
                            </motion.div>
                        </div>
                        {/* Progress Bar (at top) */}
                        <div className="w-full space-y-4">
                            <div className="h-1 w-full bg-neutral-200/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                />
                            </div>
                            <div className="flex justify-center">
                                <motion.span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.4em]">
                                    {Math.round(progress)}%
                                </motion.span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="fixed bottom-12 text-[11px] font-medium text-neutral-400 uppercase tracking-widest"
                    >
                        Initializing System...
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageLoader;
