/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface WallpaperDesignsProps {
  wallpaperId: string;
  isThumbnail?: boolean; // Set to true for smaller previews in the settings panel
}

export default function WallpaperDesigns({ wallpaperId, isThumbnail = false }: WallpaperDesignsProps) {
  // Use lower opacity or scale things down slightly for thumbnails to keep them readable
  const scaleClass = isThumbnail ? 'opacity-70 scale-95' : 'opacity-100';

  switch (wallpaperId) {
    case 'dark-mesh':
      return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${scaleClass}`}>
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/15 dark:bg-violet-500/20 rounded-full blur-[100px] md:blur-[140px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 dark:bg-emerald-400/15 rounded-full blur-[100px] md:blur-[140px]" />
          <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
          
          {/* Subtle Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
      );

    case 'dark-grid':
      return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${scaleClass}`}>
          {/* Radial dark glow */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-neutral-950/80" />
          
          {/* Tech Blueprint Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:8px_8px]" />

          {/* Blueprint Accents (Only on full desktop view, hide on thumbnail) */}
          {!isThumbnail && (
            <>
              {/* Compass / Coordinate markings in corners */}
              <div className="absolute top-16 left-6 font-mono text-[9px] text-sky-400/25 tracking-widest uppercase">
                SYS_COORDS // [47.6062° N, 122.3321° W]
              </div>
              <div className="absolute bottom-24 right-6 font-mono text-[9px] text-sky-400/25 tracking-widest uppercase">
                LAT_SCALE: 1.025x // SECURE_SHELL
              </div>
              
              {/* Abstract crosshairs */}
              <div className="absolute top-[30%] left-[20%] w-8 h-8 border border-sky-500/10 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-sky-500/20 rounded-full" />
              </div>
              <div className="absolute bottom-[35%] right-[25%] w-12 h-12 border border-violet-500/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-violet-500/20 rounded-full" />
              </div>
            </>
          )}
        </div>
      );

    case 'dark-geo':
      return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${scaleClass}`}>
          {/* Subtle angle pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.015)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.015)_75%,rgba(255,255,255,0.015))] bg-[size:40px_40px] bg-[position:0_0,20px_20px]" />
          
          {/* Clean lines and overlapping circles wireframe */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="geo-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo-dots)" />
            
            {/* Elegant Vector Art Shapes */}
            {!isThumbnail && (
              <>
                <circle cx="50%" cy="50%" r="280" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 8" />
                <circle cx="50%" cy="50%" r="180" fill="none" stroke="#fff" strokeWidth="1" />
                <circle cx="20%" cy="40%" r="120" fill="none" stroke="#fff" strokeWidth="1" />
                <circle cx="80%" cy="60%" r="150" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="30 10" />
                
                {/* Diagonal lines */}
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="#fff" strokeWidth="0.75" />
                <line x1="100%" y1="0" x2="0" y2="100%" stroke="#fff" strokeWidth="0.75" />
              </>
            )}
          </svg>
        </div>
      );

    case 'light-sand':
      return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${scaleClass}`}>
          {/* Soft warm sun rays */}
          <div className="absolute top-[20%] left-[-10%] w-[55%] h-[55%] bg-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] bg-rose-400/8 rounded-full blur-[90px]" />

          {/* Minimalist Linen/Warm Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1.5px,transparent_1.5px)] bg-[size:28px_28px]" />

          {!isThumbnail && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              {/* Very minimal concentric circles */}
              <div className="w-[600px] h-[600px] rounded-full border border-neutral-900/30 flex items-center justify-center">
                <div className="w-[400px] h-[400px] rounded-full border border-dashed border-neutral-900/20" />
              </div>
            </div>
          )}
        </div>
      );

    case 'light-spring':
      return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${scaleClass}`}>
          {/* Organic glowing light-blue and lime-green blobs */}
          <div className="absolute top-[-10%] left-[15%] w-[50%] h-[50%] bg-sky-300/20 rounded-full blur-[110px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[55%] h-[55%] bg-emerald-300/15 rounded-full blur-[120px]" />
          <div className="absolute top-[35%] right-[20%] w-[30%] h-[30%] bg-indigo-300/10 rounded-full blur-[90px]" />

          {/* Fresh spring dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_1.2px,transparent_1.2px)] bg-[size:18px_18px]" />
        </div>
      );

    case 'light-lines':
      return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${scaleClass}`}>
          {/* Cool linear architect grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:36px_36px]" />
          
          {/* Elegant light grey concentric technical SVG overlays */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            {!isThumbnail && (
              <>
                {/* Horizontal & vertical rule alignment guidelines */}
                <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#000" strokeWidth="0.5" strokeDasharray="2 4" />
                <line x1="90%" y1="0" x2="90%" y2="100%" stroke="#000" strokeWidth="0.5" strokeDasharray="2 4" />
                <line x1="0" y1="15%" x2="100%" y2="15%" stroke="#000" strokeWidth="0.5" strokeDasharray="2 4" />
                
                {/* Intersecting fine architectural drawings */}
                <circle cx="90%" cy="15%" r="100" fill="none" stroke="#000" strokeWidth="0.75" />
                <circle cx="10%" cy="80%" r="60" fill="none" stroke="#000" strokeWidth="0.75" strokeDasharray="6 6" />
                <rect x="5%" y="5%" width="120" height="80" fill="none" stroke="#000" strokeWidth="0.5" />
                
                {/* Tiny system spec labels */}
                <text x="5%" y="95%" fontFamily="monospace" fontSize="8" fill="#000" letterSpacing="1">SCALE_RATIO: 1:1 // AP_9</text>
              </>
            )}
          </svg>
        </div>
      );

    default:
      return null;
  }
}
