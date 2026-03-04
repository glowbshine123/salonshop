import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Start loading process
    const startLoading = useCallback(() => {
        setIsLoading(true);
        setProgress(0);
        setIsFinished(false);
    }, []);

    // Finish loading process
    const finishLoading = useCallback(() => {
        setIsFinished(true);
        setProgress(100);
        setTimeout(() => {
            setIsLoading(false);
        }, 800); // Wait for fade out animation
    }, []);

    // Handle initial/automatic progress (fake feel)
    useEffect(() => {
        let interval;
        if (isLoading && !isFinished) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev < 30) return prev + 2;
                    if (prev < 60) return prev + 1;
                    if (prev < 85) return prev + 0.5;
                    return prev; // Stop at 85 until finishLoading is called
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isLoading, isFinished]);

    return (
        <LoadingContext.Provider value={{ isLoading, progress, isFinished, startLoading, finishLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
