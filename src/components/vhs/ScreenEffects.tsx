import React from 'react';

interface ScreenEffectsProps {
  isChanging: boolean;
}

export function ScreenEffects({ isChanging }: ScreenEffectsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay overflow-hidden rounded-[2rem]">
      {/* Scanlines */}
      <div 
        className="absolute inset-0 z-20 opacity-[0.15]" 
        style={{
          backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
      
      {/* RGB Split / Vignette */}
      <div className="absolute inset-0 z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />

      {/* Screen Glare */}
      <div className="absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

      {/* Noise Animation (CSS) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes crt-flicker {
          0% { opacity: 0.95; }
          5% { opacity: 0.85; }
          10% { opacity: 0.95; }
          15% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes crt-roll {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes static-noise {
          0% { background-position: 0 0; }
          10% { background-position: 10px 10px; }
          20% { background-position: -10px -10px; }
          30% { background-position: 5px -5px; }
          40% { background-position: -5px 5px; }
          50% { background-position: 15px -15px; }
          60% { background-position: -15px 15px; }
          70% { background-position: 0 10px; }
          80% { background-position: 10px 0; }
          90% { background-position: -10px 10px; }
          100% { background-position: 0 0; }
        }
        .crt-flicker {
          animation: crt-flicker 0.15s infinite;
        }
      `}} />

      <div className="absolute inset-0 z-30 opacity-30 mix-blend-screen pointer-events-none" style={{
         backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
         animation: 'static-noise 0.2s steps(2) infinite'
      }} />

      {/* VHS Change Effect */}
      {isChanging && (
        <div className="absolute inset-0 z-40 bg-white/90 mix-blend-screen" 
           style={{
             backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%222%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")',
             animation: 'static-noise 0.05s infinite'
           }}
        >
           <div className="absolute inset-x-0 h-10 bg-white/50 blur-sm" style={{ animation: 'crt-roll 0.5s infinite linear' }}></div>
        </div>
      )}
      
      {/* Tracking Line */}
      {!isChanging && (
        <div className="absolute inset-x-0 h-1 bg-white/20 blur-[1px] opacity-30" style={{ animation: 'crt-roll 8s infinite linear', top: '-10%' }} />
      )}
    </div>
  );
}
