import React from 'react';
import {
    Shield,
    User,
    Gift
} from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from '../../components/ui/navigation-menu';
import { useSearchParams } from 'react-router-dom';
import ProfileSettings from './settings/ProfileSettings';
import RewardSettings from './settings/RewardSettings';
import GatewaySettings from './settings/GatewaySettings';
import PaymentSettings from './settings/PaymentSettings';
import SecuritySettings from '../../components/user/SecuritySettings';

export default function AdminSettings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab')?.toUpperCase() || 'PROFILE';
    const activeTab = ['PROFILE', 'REWARDS', 'SECURITY'].includes(currentTab) ? currentTab : 'PROFILE';

    const setActiveTab = (tabId) => {
        setSearchParams({ tab: tabId.toLowerCase() });
    };

    const tabs = [
        { id: 'PROFILE', label: 'Profile', icon: User },
        { id: 'REWARDS', label: 'Reward Engine', icon: Gift },
        { id: 'SECURITY', label: 'Security', icon: Shield },
        // { id: 'GATEWAY', label: 'Gateway', icon: Zap },
        // { id: 'PAYMENT', label: 'Payment', icon: CreditCard },
        // { id: 'GENERAL', label: 'Platform Settings', icon: Globe },
        // { id: 'NOTIFICATIONS', label: 'Comms Engine', icon: Bell },
    ];

    return (
        <div className="animate-in fade-in duration-700 pb-20">
            <div className='pb-2'>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Admin <span className="text-primary">Settings</span></h1>
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your profile and platform configurations</p>
            </div>

            <div className="w-fit pb-4">
                <NavigationMenu>
                    <NavigationMenuList>
                        {tabs.map((tab) => (
                            <NavigationMenuItem key={tab.id}>
                                <NavigationMenuLink
                                    className={`${navigationMenuTriggerStyle()} ${activeTab === tab.id && 'bg-primary/5'} cursor-pointer`}
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
                    {activeTab === 'PROFILE' && <ProfileSettings />}
                    {activeTab === 'REWARDS' && <RewardSettings />}
                    {activeTab === 'SECURITY' && <SecuritySettings />}
                    {activeTab === 'GATEWAY' && <GatewaySettings />}
                    {activeTab === 'PAYMENT' && <PaymentSettings />}
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            </div>
        </div>
    );
}
