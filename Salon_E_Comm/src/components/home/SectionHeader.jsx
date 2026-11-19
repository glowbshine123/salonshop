import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

const SectionHeader = ({ icon: Icon, iconColor, label, title, actionText, onAction, actionIconColor = "text-primary" }) => (
    <div className="flex flex-row items-center justify-between gap-2 md:gap-6 mb-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">{title}</h2>
        <Button onClick={onAction} variant="ghost" className="group flex items-center gap-1 text-sm font-bold text-neutral-500 hover:text-neutral-900 duration-100 transition-colors">
            {actionText}
            <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${actionIconColor}`} />
        </Button>
    </div>
);

export default SectionHeader;
