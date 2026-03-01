import React from 'react';
import Plasma from "@/components/ui/plasma";

export default function AuthSidePanel() {
    return (
        <div className="hidden lg:block w-1/2 p-4">
            <div className="h-full bg-neutral-900 rounded-[48px] relative overflow-hidden flex items-center justify-center border-8 border-bg-secondary shadow-2xl">
                <div className="relative w-full h-full opacity-40">
                    <Plasma
                        color="#FF1B6B"
                        speed={0.4}
                        direction="forward"
                        scale={1.2}
                        opacity={0.6}
                        mouseInteractive={false} />
                </div>
                <div className="absolute z-10 text-center p-12 max-w-lg pointer-events-none space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-white border border-white/10">
                        Professional Network
                    </div>
                    <h2 className="text-6xl font-display font-black text-white leading-[0.9] tracking-tighter">
                        START YOUR <br />
                        <span className="text-primary italic">SALON</span> LIKE <br />
                        A PRO.
                    </h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                        Access exclusive B2B rituals, professional pricing, and seamless logistics.
                    </p>
                </div>
            </div>
        </div>
    );
}
