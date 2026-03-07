import React from 'react';

export default function AuthHeader({ title, subtitle }) {

    return (
        <div className='space-y-1'>
            <div className="w-fit h-12 mb-2">
                <img src="/logo.jpeg" alt="Salon Logo" className="w-full h-full object-contain rounded-md" />
            </div>

            <h1 className="text-3xl text-foreground tracking-tighter">{title}</h1>
            <p className="text-foreground-muted font-medium">{subtitle}</p>
        </div>
    );
}
