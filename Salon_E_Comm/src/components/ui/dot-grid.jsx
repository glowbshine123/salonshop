'use client';
import { useRef, useEffect } from 'react';

const DotGrid = ({
    dotSize = 4,
    gap = 20,
    baseColor = '#D4D4D4',
    className = '',
    style
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const draw = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const width = parent.clientWidth;
            const height = parent.clientHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = baseColor;

            // Calculate Grid
            // Center the grid
            const cols = Math.floor((width + gap) / (dotSize + gap));
            const rows = Math.floor((height + gap) / (dotSize + gap));

            const cell = dotSize + gap;
            const gridW = cols * cell - gap;
            const gridH = rows * cell - gap; // Approximate

            const startX = (width - gridW) / 2;
            const startY = (height - gridH) / 2;

            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    const cx = startX + x * cell;
                    const cy = startY + y * cell;

                    ctx.beginPath();
                    ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        draw();

        const handleResize = () => draw();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dotSize, gap, baseColor]);

    return (
        <div className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} style={style}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
};

export default DotGrid;
