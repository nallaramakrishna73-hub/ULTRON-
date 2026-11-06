import React, { useEffect, useRef } from 'react';
import { OrbState } from '../types';

interface SpaceEnvironmentProps {
  state: OrbState;
  audioLevel?: number; // 0 to 1
  className?: string;
}

export const SpaceEnvironment: React.FC<SpaceEnvironmentProps> = ({
  state,
  audioLevel = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const audioLevelRef = useRef(audioLevel);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // 1. Cosmic Stars Setup (450 deep-space stars with 3D depth layers)
    const starCount = 420;
    const stars: {
      x: number;
      y: number;
      z: number;
      size: number;
      brightness: number;
      twinkleSpeed: number;
      color: string;
    }[] = [];

    const starPalettes = [
      'rgba(255, 255, 255, ',
      'rgba(186, 230, 253, ', // cyan-100
      'rgba(233, 213, 255, ', // purple-100
      'rgba(147, 197, 253, ', // blue-200
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * width,
        size: Math.random() * 1.8 + 0.4,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        color: starPalettes[Math.floor(Math.random() * starPalettes.length)],
      });
    }

    // 2. Cosmic Nebula Dust Clouds
    const nebulaClouds = [
      { x: width * 0.3, y: height * 0.35, r: width * 0.45, color: 'rgba(99, 102, 241, 0.045)' }, // Indigo
      { x: width * 0.7, y: height * 0.65, r: width * 0.4, color: 'rgba(168, 85, 247, 0.04)' },  // Purple
      { x: width * 0.5, y: height * 0.5, r: width * 0.35, color: 'rgba(6, 182, 212, 0.035)' },   // Cyan
    ];

    let animFrameId: number;
    let time = 0;
    let smoothedAudio = 0;

    const render = () => {
      time += 0.015;
      const currentState = stateRef.current;
      const currentAudio = audioLevelRef.current;

      smoothedAudio += (currentAudio - smoothedAudio) * 0.15;

      // Clear with deep space canvas gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.85
      );
      bgGrad.addColorStop(0, '#060a17'); // Dark cosmic navy center
      bgGrad.addColorStop(0.55, '#03050c'); // Deep obsidian
      bgGrad.addColorStop(1, '#010206'); // Midnight pitch black
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle nebula clouds with time breathing
      ctx.save();
      nebulaClouds.forEach((nebula, idx) => {
        const pulse = 1.0 + Math.sin(time * 0.6 + idx) * 0.08 + smoothedAudio * 0.15;
        const grad = ctx.createRadialGradient(
          nebula.x + Math.sin(time * 0.3 + idx) * 40,
          nebula.y + Math.cos(time * 0.25 + idx) * 30,
          0,
          nebula.x,
          nebula.y,
          nebula.r * pulse
        );
        grad.addColorStop(0, nebula.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });
      ctx.restore();

      // Render 3D Floating Cosmic Stars
      const cx = width / 2;
      const cy = height / 2;

      let speedZ = 0.35;
      if (currentState === 'thinking') speedZ = 1.6;
      else if (currentState === 'listening') speedZ = 0.5 + smoothedAudio * 1.5;

      ctx.save();
      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        star.z -= speedZ;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 1.5;
          star.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 280 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px < width && py >= 0 && py < height) {
          const alpha = Math.min(1, Math.max(0.1, (1 - star.z / width) * star.brightness + Math.sin(time * 3 + i) * 0.2));
          const size = Math.max(0.6, star.size * k * 0.8);

          ctx.fillStyle = `${star.color}${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // =========================================================================
      // INTEGRATED FULL-SCREEN VOICE VISUALIZER & ENERGY RAYS
      // =========================================================================
      ctx.save();
      const centerX = width / 2;
      const centerY = height / 2;

      // Ambient Central Halo
      const haloRadius = Math.min(width, height) * 0.28;
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        haloRadius * (1.0 + smoothedAudio * 0.4)
      );

      let haloColor = 'rgba(6, 182, 212, '; // Cyan
      if (currentState === 'speaking') {
        haloColor = 'rgba(168, 85, 247, '; // Purple
      } else if (currentState === 'thinking') {
        haloColor = 'rgba(59, 130, 246, '; // Electric Blue
      }

      haloGrad.addColorStop(0, `${haloColor}${0.08 + smoothedAudio * 0.12})`);
      haloGrad.addColorStop(0.5, `${haloColor}${0.03 + smoothedAudio * 0.05})`);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, width, height);

      // Voice Activity Waveform Waves (When Listening or Speaking)
      if (currentState === 'listening' || currentState === 'speaking' || smoothedAudio > 0.05) {
        const waveCount = 3;
        for (let w = 0; w < waveCount; w++) {
          const waveRadius = (haloRadius * 0.7) + w * 45 + smoothedAudio * 60;
          ctx.beginPath();
          const segments = 120;
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI * 2;
            const freq = Math.sin(angle * 8 + time * 4 + w) * Math.cos(angle * 4 - time * 2);
            const offset = freq * (12 + smoothedAudio * 45);
            const r = waveRadius + offset;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          ctx.strokeStyle =
            currentState === 'speaking'
              ? `rgba(168, 85, 247, ${0.35 - w * 0.1 + smoothedAudio * 0.3})`
              : `rgba(6, 182, 212, ${0.4 - w * 0.1 + smoothedAudio * 0.3})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Processing / Thinking State: Rotating Photon Light Rings
      if (currentState === 'thinking') {
        const ringCount = 2;
        for (let r = 0; r < ringCount; r++) {
          const dir = r % 2 === 0 ? 1 : -1;
          const rotAngle = time * 3.5 * dir;
          const radius = haloRadius * 0.85 + r * 30;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, rotAngle, rotAngle + Math.PI * 0.65);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.55 - r * 0.15})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, rotAngle + Math.PI, rotAngle + Math.PI * 1.65);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.55 - r * 0.15})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
