import React from 'react';
import Plasma from "@/components/ui/plasma";

export default function AuthSidePanel() {
    return (
        <div className="hidden lg:block w-1/2 p-2">
            <div className="h-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full">
                    <Plasma
                        color="#ff5a8a"
                        speed={0.6}
                        direction="forward"
                        scale={1}
                        opacity={0.8}
                        mouseInteractive={false} />
                </div>
                <div className="absolute z-10 text-center p-12 max-w-lg pointer-events-none">
                    <h2 className="text-5xl font-semibold text-white mb-6 leading-tighter">
                        Start Your Salon Like A <span className='text-primary font-black'>PRO</span>.
                    </h2>
                </div>
            </div>
        </div>
    );
}
