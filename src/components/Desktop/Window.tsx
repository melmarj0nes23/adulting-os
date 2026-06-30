/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Minus, Square, X, RefreshCw } from 'lucide-react';
import { WindowInstance } from '../../types';

interface WindowProps {
  key?: string;
  windowState: WindowInstance;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  activeWindowId: string | null;
  children: React.ReactNode;
  uiScale?: 'compact' | 'standard' | 'large';
  blurIntensity?: 'none' | 'medium' | 'high';
}

export default function Window({
  windowState,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onResize,
  onMove,
  activeWindowId,
  children,
  uiScale = 'standard',
  blurIntensity = 'none',
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const isFocused = activeWindowId === windowState.id;
  const { id, title, isMinimized, isMaximized, x, y, width, height, zIndex } = windowState;

  // Dynamic blurring intensity based on preferences
  let blurClass = 'backdrop-blur-2xl bg-white/80 dark:bg-zinc-900/65';
  if (blurIntensity === 'none') {
    blurClass = 'backdrop-blur-none bg-white/95 dark:bg-zinc-900/95';
  } else if (blurIntensity === 'high') {
    blurClass = 'backdrop-blur-3xl bg-white/70 dark:bg-zinc-900/55';
  }

  // Dynamic UI scaling based on preferences
  let uiScaleClass = '';
  let titleBarHeightClass = 'h-11';
  let titleBarPaddingClass = 'px-4';
  let dragHandleHeightClass = 'h-11';
  if (uiScale === 'compact') {
    uiScaleClass = 'text-xs select-none';
    titleBarHeightClass = 'h-9';
    titleBarPaddingClass = 'px-3';
    dragHandleHeightClass = 'h-9';
  } else if (uiScale === 'large') {
    uiScaleClass = 'text-base select-none';
    titleBarHeightClass = 'h-13';
    titleBarPaddingClass = 'px-5';
    dragHandleHeightClass = 'h-13';
  }

  // Track if screen is mobile to force full screen mode
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track resizing state using PointerEvents
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartDim = useRef({ w: 0, h: 0 });

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus(id);
    
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartDim.current = { w: width, h: height };
  };

  useEffect(() => {
    const handleResizeMove = (e: PointerEvent) => {
      if (!isResizing) return;
      const dx = e.clientX - resizeStartPos.current.x;
      const dy = e.clientY - resizeStartPos.current.y;
      
      const nextWidth = Math.max(320, resizeStartDim.current.w + dx);
      const nextHeight = Math.max(240, resizeStartDim.current.h + dy);
      
      onResize(id, nextWidth, nextHeight);
    };

    const handleResizeEnd = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener('pointermove', handleResizeMove);
      window.addEventListener('pointerup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeEnd);
    };
  }, [isResizing, id, onResize]);

  // Handle header double-click to maximize
  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable maximizing toggles on mobile where it is locked to fullscreen
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    onMaximize(id);
  };

  if (isMinimized) return null;

  // Force full-screen responsive layout on mobile
  const finalX = (isMaximized || isMobile) ? 0 : x;
  const finalY = (isMaximized || isMobile) ? 0 : y;
  const finalWidth = (isMaximized || isMobile) ? '100%' : width;
  const finalHeight = (isMaximized || isMobile) ? '100%' : height;

  return (
    <motion.div
      ref={windowRef}
      onPointerDown={() => onFocus(id)}
      style={{
        position: 'absolute',
        left: finalX,
        top: finalY,
        width: finalWidth,
        height: finalHeight,
        zIndex: zIndex,
      }}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`flex flex-col rounded-[20px] ${isMobile ? 'rounded-none' : ''} ${blurClass} border border-zinc-200/50 dark:border-white/5 shadow-2xl overflow-hidden transition-shadow ${uiScaleClass} ${
        isFocused 
          ? 'shadow-black/25 dark:shadow-black/60 ring-1 ring-black/5 dark:ring-white/10 border-zinc-300 dark:border-white/10' 
          : 'shadow-black/15 dark:shadow-black/40 opacity-95 dark:opacity-90'
      }`}
      id={`window-${id}`}
    >
      {/* Draggable Header Titlebar */}
      <div
        onDoubleClick={handleHeaderDoubleClick}
        onPointerDown={(e) => {
          onFocus(id);
          // Only start dragging if clicking outside controls
          const isControl = (e.target as HTMLElement).closest('.window-control-btn');
          if (isControl) {
            e.stopPropagation();
          }
        }}
        className={`window-title-bar flex items-center justify-between ${titleBarHeightClass} ${titleBarPaddingClass} bg-black/[0.01] dark:bg-white/[0.02] border-b border-zinc-200/60 dark:border-white/5 cursor-default select-none`}
      >
        {/* Left Side: Windows Control Buttons (macOS-inspired but customized with generous touch-targets for mobile) */}
        <div className="window-controls flex items-center gap-2.5 sm:gap-2">
          <button
            id={`window-${id}-close`}
            onClick={() => onClose(id)}
            className="window-control-btn group relative w-6 h-6 sm:w-3.5 sm:h-3.5 rounded-full bg-rose-500/80 hover:bg-rose-500 flex items-center justify-center transition-all shadow-sm"
            title="Close"
          >
            <X className="w-3.5 h-3.5 sm:w-2 sm:h-2 text-rose-950 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button
            id={`window-${id}-minimize`}
            onClick={() => onMinimize(id)}
            className="window-control-btn group relative w-6 h-6 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-500/80 hover:bg-amber-500 flex items-center justify-center transition-all shadow-sm"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5 sm:w-2 sm:h-2 text-amber-950 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
          </button>
          
          {!isMobile && (
            <button
              id={`window-${id}-maximize`}
              onClick={() => onMaximize(id)}
              className="window-control-btn group relative w-6 h-6 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center transition-all shadow-sm"
              title="Maximize"
            >
              <Square className="w-2.5 h-2.5 sm:w-1.5 sm:h-1.5 text-emerald-950 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 pointer-events-none tracking-wide">
          {title}
        </div>

        {/* Right Side: Spacer/Actions */}
        <div className="w-14" />
      </div>

      {/* Main Window Body */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Custom Draggable Drag handle trigger using PointerEvents */}
      {!(isMaximized || isMobile) && (
        <div
          onPointerDown={(e) => {
            const target = e.currentTarget as HTMLDivElement;
            try {
              target.setPointerCapture(e.pointerId);
            } catch (err) {}

            e.stopPropagation();
            e.preventDefault();
            onFocus(id);
            // Initiate standard window titlebar moving if they hold titlebar
            const startX = e.clientX;
            const startY = e.clientY;
            const startWinX = x;
            const startWinY = y;

            const handlePointerMove = (moveEvent: PointerEvent) => {
              const dx = moveEvent.clientX - startX;
              const dy = moveEvent.clientY - startY;
              onMove(id, startWinX + dx, startWinY + dy);
            };

            const handlePointerUp = (upEvent: PointerEvent) => {
              window.removeEventListener('pointermove', handlePointerMove);
              window.removeEventListener('pointerup', handlePointerUp);
              try {
                target.releasePointerCapture(upEvent.pointerId);
              } catch (err) {}
            };

            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
          }}
          className={`absolute top-0 left-24 right-12 ${dragHandleHeightClass} cursor-move touch-none`}
          style={{ zIndex: 1 }}
        />
      )}

      {/* Custom Window Resize handle bottom-right with PointerEvents */}
      {!(isMaximized || isMobile) && (
        <div
          onPointerDown={(e) => {
            const target = e.currentTarget as HTMLDivElement;
            try {
              target.setPointerCapture(e.pointerId);
            } catch (err) {}

            const handlePointerUp = (upEvent: PointerEvent) => {
              window.removeEventListener('pointerup', handlePointerUp);
              try {
                target.releasePointerCapture(upEvent.pointerId);
              } catch (err) {}
            };
            window.addEventListener('pointerup', handlePointerUp);

            handleResizeStart(e);
          }}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1.5 touch-none"
        >
          {/* Subtle resize icon stripes */}
          <svg width="6" height="6" viewBox="0 0 6 6" className="text-black/20 dark:text-white/20 hover:text-black/40 dark:hover:text-white/40 transition-colors">
            <line x1="6" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" />
            <line x1="6" y1="3" x2="3" y2="6" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
