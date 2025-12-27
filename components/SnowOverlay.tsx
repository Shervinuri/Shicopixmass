import React, { useEffect, useRef } from 'react';

interface SnowOverlayProps {
    enabled: boolean;
}

interface Snowflake {
    x: number;
    y: number;
    radius: number;
    density: number;
    vy: number;
    vx: number;
    landed: boolean;
    landedOn: DOMRect | null;
    alpha: number;
    meltRate: number;
    initialX: number;
    swayOffset: number;
    rotation: number;
    rotationSpeed: number;
}

const SnowOverlay: React.FC<SnowOverlayProps> = ({ enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const spriteSize = 32;
    const snowflakeSprite = document.createElement('canvas');
    snowflakeSprite.width = spriteSize;
    snowflakeSprite.height = spriteSize;
    const sCtx = snowflakeSprite.getContext('2d');

    if (sCtx) {
        sCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        sCtx.lineWidth = 2.2; 
        sCtx.lineCap = 'round';
        sCtx.shadowBlur = 4;
        sCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        
        const cx = spriteSize / 2;
        const cy = spriteSize / 2;
        const r = (spriteSize / 2) - 4;

        for (let i = 0; i < 6; i++) {
            sCtx.save();
            sCtx.translate(cx, cy);
            sCtx.rotate((Math.PI / 3) * i);
            sCtx.beginPath();
            sCtx.moveTo(0, 0);
            sCtx.lineTo(0, -r);
            sCtx.stroke();
            sCtx.beginPath();
            sCtx.moveTo(0, -r * 0.6);
            sCtx.lineTo(r * 0.25, -r * 0.45);
            sCtx.moveTo(0, -r * 0.6);
            sCtx.lineTo(-r * 0.25, -r * 0.45);
            sCtx.stroke();
            sCtx.beginPath();
            sCtx.moveTo(0, -r * 0.3);
            sCtx.lineTo(r * 0.15, -r * 0.2);
            sCtx.moveTo(0, -r * 0.3);
            sCtx.lineTo(-r * 0.15, -r * 0.2);
            sCtx.stroke();
            sCtx.restore();
        }
    }

    const particleCount = width < 768 ? 350 : 850; 
    const particles: Snowflake[] = [];

    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(width, height, true));
    }

    function createParticle(w: number, h: number, randomY: boolean = false): Snowflake {
        return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : -20,
            initialX: Math.random() * w,
            radius: Math.random() * 0.3 + 0.2, 
            density: Math.random() * particleCount,
            vy: Math.random() * 1.5 + 1,
            vx: Math.random() * 1 - 0.5,
            landed: false,
            landedOn: null,
            alpha: Math.random() * 0.3 + 0.7,
            meltRate: Math.random() * 0.003 + 0.0005,
            swayOffset: Math.random() * 100,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05 
        };
    }

    const update = () => {
        const flatTargets = Array.from(document.querySelectorAll('.prompt-box, .image-card'));
        const curvedHeader = document.querySelector('.arched-header');
        
        const flatRects = flatTargets.map(t => t.getBoundingClientRect());
        let headerRect: DOMRect | null = null;
        if (curvedHeader) headerRect = curvedHeader.getBoundingClientRect();

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];

            if (p.landed) {
                p.alpha -= p.meltRate;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.ellipse(p.x, p.y, (p.radius * 10), (p.radius * 6), 0, 0, Math.PI * 2);
                ctx.fill();

                if (p.alpha <= 0) particles[i] = createParticle(width, height);
            } else {
                p.x += Math.sin(p.density + p.swayOffset) * 0.5 + p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;

                if (p.y > height) {
                    particles[i] = createParticle(width, height);
                } else {
                    let hasCollided = false;
                    if (p.y > 0) { 
                        if (headerRect && p.x >= headerRect.left && p.x <= headerRect.right) {
                            const verticalRadius = 20;
                            const horizontalRadius = headerRect.width / 2;
                            const centerX = headerRect.left + horizontalRadius;
                            const dist = p.x - centerX;
                            const normalizedDist = dist / horizontalRadius;
                            if (Math.abs(normalizedDist) <= 1) {
                                const curveHeight = verticalRadius * Math.sqrt(1 - normalizedDist * normalizedDist);
                                const visualY = (headerRect.top + verticalRadius) - curveHeight;
                                if (p.y >= visualY - 4 && p.y <= visualY + 4) {
                                    p.landed = true;
                                    p.y = visualY;
                                    hasCollided = true;
                                }
                            }
                        }
                        if (!hasCollided) {
                            for (const rect of flatRects) {
                                if (p.x > rect.left && p.x < rect.right && p.y >= rect.top - 5 && p.y <= rect.top + 10) {
                                    p.landed = true;
                                    p.y = rect.top + (Math.random() * 4 - 2);
                                    hasCollided = true;
                                    break; 
                                }
                            }
                        }
                    }
                    if (p.x > width + 10) p.x = -10;
                    if (p.x < -10) p.x = width + 10;
                    if (!p.landed) {
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.scale(p.radius, p.radius);
                        ctx.globalAlpha = p.alpha;
                        ctx.drawImage(snowflakeSprite, -spriteSize/2, -spriteSize/2);
                        ctx.restore();
                    }
                }
            }
        }
        requestRef.current = requestAnimationFrame(update);
    };
    update();
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ opacity: 0.95 }} />;
};

export default SnowOverlay;