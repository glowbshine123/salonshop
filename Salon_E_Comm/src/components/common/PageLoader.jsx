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
                    className="fixed inset-0 z-9999! flex flex-col items-center justify-center bg-background"
                >
                    <div className="max-w-xs flex flex-col items-center gap-4 px-4">
                        {/* Logo and Name (below loader line) */}
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className=""
                            >
                                <img src="/logo_white.png" alt="Logo" className="w-full h-full object-contain" />
                            </motion.div>
                        </div>
                        <div className="w-full space-y-4 mt-4">
                            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                />
                            </div>
                            <div className="flex justify-center">
                                <motion.span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
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
                        className="fixed bottom-12 text-[11px] font-black text-muted-foreground uppercase tracking-widest"
                    >
                        Initializing System...
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageLoader;
