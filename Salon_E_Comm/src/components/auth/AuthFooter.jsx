import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthFooter() {
    return (
        <p className="text-center text-xs tracking-wide text-foreground-muted font-medium pt-2">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-foreground underline hover:text-foreground transition-colors">
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-foreground underline hover:text-foreground transition-colors">
                Privacy Policy
            </Link>
            .
        </p>
    );
}
