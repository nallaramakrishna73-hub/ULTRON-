import React from 'react';

interface CyberBackgroundProps {
  theme?: 'gold' | 'neon' | 'red';
}

export const CyberBackground: React.FC<CyberBackgroundProps> = ({ theme = 'gold' }) => {
  // Theme-specific glow colors
  const primaryGlow =
    theme === 'gold'
      ? 'rgba(245, 158, 11, 0.15)'
      : theme === 'red'
      ? 'rgba(239, 68, 68, 0.15)'
      : 'rgba(6, 182, 212, 0.15)';

  const secondaryGlow =
    theme === 'gold'
      ? 'rgba(217, 119, 6, 0.12)'
      : theme === 'red'
      ? 'rgba(185, 28, 28, 0.12)'
      : 'rgba(168, 85, 247, 0.15)';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Deep space base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03050c] via-[#050816] to-[#020308]" />

      {/* Atmospheric ambient radial spotlights */}
      <div
        className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] rounded-full blur-[140px] opacity-60 transition-colors duration-700"
        style={{ background: primaryGlow }}
      />
      <div
        className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] rounded-full blur-[160px] opacity-50 transition-colors duration-700"
        style={{ background: secondaryGlow }}
      />
      <div
        className="absolute top-[30%] right-[30%] w-[500px] h-[500px] rounded-full blur-[130px] opacity-30 transition-colors duration-700"
        style={{ background: primaryGlow }}
      />

      {/* Vertical Cyber Light Columns / Neon Beams in the background */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent shadow-[0_0_12px_#06b6d4]" />
        <div className="absolute left-[24%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent shadow-[0_0_12px_#a855f7]" />
        <div className="absolute right-[22%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent shadow-[0_0_12px_#6366f1]" />
        <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-amber-500/40 to-transparent shadow-[0_0_12px_#f59e0b]" />
      </div>

      {/* Cybernetic perspective floor grid */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] overflow-hidden opacity-35 [perspective:600px]">
        <div
          className="absolute inset-0 [transform:rotateX(68deg)] origin-bottom"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.22) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.22) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)',
          }}
        />
        {/* Floor Horizon Glow line */}
        <div className="absolute top-[28%] left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-[1px]" />
      </div>

      {/* Subtle Digital Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,4,10,0.75)_100%)]" />

      {/* Tech Hex / Scanline subtle overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 3px)',
        }}
      />
    </div>
  );
};
