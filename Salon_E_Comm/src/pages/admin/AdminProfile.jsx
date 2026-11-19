import React, { useState } from 'react';
import {
    User,
    Mail,
    ShieldAlert,
    Lock,
    Key,
    FileLock2,
    Fingerprint,
    Activity,
    ChevronRight,
    ShieldCheck,
    Save,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';

export default function AdminProfile() {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Profile Header */}
            <div className="relative">
                <div className="h-64 bg-neutral-900 rounded-[64px] overflow-hidden relative border border-neutral-800 shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-transparent to-primary/10" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full -ml-36 -mb-36 blur-3xl opacity-50" />

                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-[32px] p-1 shadow-2xl">
                                <div className="w-full h-full bg-neutral-100 rounded-[28px] flex items-center justify-center text-neutral-400">
                                    <User size={40} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-black text-white tracking-tighter">{user?.firstName} {user?.lastName}</h1>
                                    <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg">System Root</span>
                                </div>
                                <p className="text-primary/80 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <ShieldCheck size={12} />
                                    Full System Authorization Active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white p-12 rounded-[56px] border border-neutral-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-3 px-2">
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Security <span className="text-primary">Credentials</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Administrative Node</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                    <input
                                        type="text"
                                        defaultValue={user?.firstName + ' ' + user?.lastName}
                                        className="w-full pl-14 pr-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Secure Endpoint</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                    <input
                                        type="email"
                                        defaultValue={user?.email}
                                        disabled
                                        className="w-full pl-14 pr-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none opacity-60 text-neutral-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-neutral-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                                    <ShieldAlert size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest leading-none">Global Access</p>
                                    <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em] leading-none">Last sync: today at 09:12 AM</p>
                                </div>
                            </div>
                            <Button className="h-14 px-10 bg-neutral-900 hover:bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-900/10">
                                <Save size={16} />
                                Persist Identity
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white p-12 rounded-[56px] border border-neutral-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Security <span className="text-primary">Protocols</span></h2>
                            <Fingerprint className="text-neutral-200" size={32} />
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Multi-Factor Authentication', status: 'Enabled', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
                                { label: 'API Session Hardening', status: 'Active', icon: Lock, color: 'text-primary', bg: 'bg-primary/10' },
                                { label: 'Database Encryption Keys', status: 'Rotated (3d ago)', icon: Key, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-neutral-50/50 rounded-3xl border border-neutral-100 hover:border-primary/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center border border-current/10 shrink-0`}>
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">{item.label}</h4>
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Global System Policy</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                        <ChevronRight size={16} className="text-neutral-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-10 bg-neutral-900 rounded-[56px] text-white space-y-8 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <Activity size={28} className="text-primary" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black tracking-tight mb-2">Access Logs</h4>
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Tracking latest administrative activities across nodes.</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex gap-4 pb-4 border-b border-white/5">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tight">Root Payout Approval</p>
                                        <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1">v1/api/payouts/approve • 2m ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 border-b border-white/5 pb-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tight">Global Config Mesh Update</p>
                                        <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-1">v1/api/settings/update • 1h ago</p>
                                    </div>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                View Audit Trail
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    </div>

                    <div className="p-10 bg-white border border-neutral-100 rounded-[56px] shadow-sm space-y-6">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
                            <FileLock2 size={28} />
                        </div>
                        <h4 className="font-black text-neutral-900 uppercase tracking-tight">System Lockdown</h4>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed">Immediately freeze all platform transactions and access points.</p>
                        <Button variant="destructive" className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-2xl border-none shadow-xl shadow-red-500/20">
                            Engage Protocol
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
