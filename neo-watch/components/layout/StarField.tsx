"use client";

import { useEffect, useRef, memo } from "react";

// {{{ Star Field Props
interface StarFieldProps {
  starCount?: number;
  speed?: number;
  className?: string;
}
// }}}

// {{{ Star Field Component
function StarFieldComponent({
  starCount = 200,
  speed = 0.5,
  className = "",
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars
    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
      color: string;
    }

    const stars: Star[] = [];
    const colors = [
      "255, 255, 255", // White
      "200, 220, 255", // Blue-white
      "255, 220, 200", // Warm white
      "180, 200, 255", // Cool blue
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Add some brighter "feature" stars
    for (let i = 0; i < 10; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 2,
        opacity: 0.8,
        twinkleSpeed: Math.random() * 0.03 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += speed * 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.twinklePhase);
        const currentOpacity = star.opacity * (0.7 + 0.3 * twinkle);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${currentOpacity})`;
        ctx.fill();

        // Add glow effect for larger stars
        if (star.size > 2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 2
          );
          gradient.addColorStop(0, `rgba(${star.color}, ${currentOpacity * 0.3})`);
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [starCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
// }}}

// {{{ Memoized Export
export const StarField = memo(StarFieldComponent);
StarField.displayName = "StarField";
// }}}

// {{{ CSS Star Field Alternative (Less CPU intensive)
export function CSSStarField() {
  return (
    <>
      <div className="starfield" aria-hidden="true" />
      <div className="nebula-bg" aria-hidden="true" />
    </>
  );
}
// }}}
