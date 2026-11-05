import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isActive?: boolean;
  color?: string;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive = true,
  color = '#06b6d4',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;
    const barCount = 36;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 1.5;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 1.5);
        let amplitude = 0.2;

        if (isActive) {
          // Complex organic waveform simulation
          const wave1 = Math.sin(phase * 2.5 + i * 0.35);
          const wave2 = Math.cos(phase * 1.5 - i * 0.25);
          const wave3 = Math.sin(phase * 4 + i * 0.6) * 0.3;
          amplitude = Math.abs((wave1 + wave2 + wave3) / 2.3);
        }

        const barHeight = Math.max(3, amplitude * (height * 0.85));
        const y = (height - barHeight) / 2;

        // Gradient from cyan to purple
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, color);
        grad.addColorStop(1, '#a855f7');

        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = isActive ? 6 : 0;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      phase += isActive ? 0.04 : 0.005;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={36}
      className={`w-full h-9 rounded ${className}`}
    />
  );
};
