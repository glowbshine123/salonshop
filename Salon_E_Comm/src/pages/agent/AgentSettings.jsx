import React from 'react';
import {
    User,
    Shield,
    CreditCard
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-6 px-2">
                <div>
                    <h4 className="text-xs font-bold text-neutral-500 capitalize tracking-wide mb-1">Data Privacy</h4>
                    <p className="text-xs font-semibold text-neutral-400 leading-relaxed capitalize tracking-wide">Your coordinates are encrypted and only used for contractual fulfillment and disbursements.</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-neutral-500 capitalize tracking-wide mb-1">Synchronization</h4>
                    <p className="text-xs font-semibold text-neutral-400 leading-relaxed capitalize tracking-wide">Profile updates are instantaneous across the platform ledger. Financial sync may take 24h.</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-neutral-500 capitalize tracking-wide mb-1">Security</h4>
                    <p className="text-xs font-semibold text-neutral-400 leading-relaxed capitalize tracking-wide">Multi-factor authentication is recommended for all financial nodal changes.</p>
                </div>
            </div>
        </div>
    );
}
