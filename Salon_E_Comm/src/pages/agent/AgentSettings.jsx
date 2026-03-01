import React, { useState } from 'react';
import {
    User,
    Shield,
    CreditCard,
    Settings,
    ChevronRight
} from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from '../../components/ui/navigation-menu';
import { useSearchParams } from 'react-router-dom';
import AgentProfileSettings from './settings/AgentProfileSettings';
import AgentPayoutSettings from './settings/AgentPayoutSettings';
import SecuritySettings from '../../components/common/SecuritySettings';

export default function AgentSettings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab')?.toUpperCase() || 'PROFILE';
    const activeTab = ['PROFILE', 'PAYOUT', 'SECURITY'].includes(currentTab) ? currentTab : 'PROFILE';

    const setActiveTab = (tabId) => {
        setSearchParams({ tab: tabId.toLowerCase() });
    };

    const tabs = [
        { id: 'PROFILE', label: 'Profile', icon: User },
        { id: 'PAYOUT', label: 'Payout Details', icon: CreditCard },
        { id: 'SECURITY', label: 'Security', icon: Shield },
    ];

    return (
        <div className="animate-in fade-in duration-700 pb-20">
            <div className='pb-2'>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Agent <span className="text-emerald-600">Settings</span></h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your professional profile and disbursement configurations</p>
            </div>

            <div className="w-fit pb-4">
                <NavigationMenu>
                    <NavigationMenuList>
                        {tabs.map((tab) => (
                            <NavigationMenuItem key={tab.id}>
                                <NavigationMenuLink
                                    className={`${navigationMenuTriggerStyle()} ${activeTab === tab.id && 'bg-emerald-500/5'} cursor-pointer`}
                                    active={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <tab.icon size={14} />
                                        <span className="font-bold text-xs uppercase tracking-wider">{tab.label}</span>
                                    </div>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    {activeTab === 'PROFILE' && <AgentProfileSettings />}
                    {activeTab === 'PAYOUT' && <AgentPayoutSettings />}
                    {activeTab === 'SECURITY' && <SecuritySettings />}
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            </div>

            {/* Bottom Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 group hover:border-emerald-500/20 transition-all duration-500">
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 group-hover:text-emerald-600 transition-colors">Data Privacy</h4>
                    <p className="text-[9px] font-bold text-neutral-500 leading-relaxed uppercase tracking-tight">Your coordinates are encrypted and only used for contractual fulfillment and disbursements.</p>
                </div>
                <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 group hover:border-emerald-500/20 transition-all duration-500">
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 group-hover:text-emerald-600 transition-colors">Synchronization</h4>
                    <p className="text-[9px] font-bold text-neutral-500 leading-relaxed uppercase tracking-tight">Profile updates are instantaneous across the platform ledger. Financial sync may take 24h.</p>
                </div>
                <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 group hover:border-emerald-500/20 transition-all duration-500">
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 group-hover:text-emerald-600 transition-colors">Security</h4>
                    <p className="text-[9px] font-bold text-neutral-500 leading-relaxed uppercase tracking-tight">Multi-factor authentication is recommended for all financial nodal changes.</p>
                </div>
            </div>
        </div>
    );
}
