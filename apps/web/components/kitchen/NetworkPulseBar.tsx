"use client";

import React from "react";
import { Zap, Activity, ExternalLink } from "lucide-react";

interface NetworkPulseBarProps {
  currentSlot: number;
}

export function NetworkPulseBar({ currentSlot }: NetworkPulseBarProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card/60 px-4 py-2.5 backdrop-blur-xs shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Live status and slot */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            <span className="font-semibold text-[11px] sm:text-xs">Cookie Chain SVM</span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-border" />

          <div className="flex items-center gap-1 font-mono text-[11px] text-text-muted">
            <span>Slot</span>
            <span className="font-semibold text-text">
              {currentSlot > 0 ? `#${currentSlot.toLocaleString()}` : "Syncing..."}
            </span>
          </div>
        </div>

        {/* Center: Performance metrics */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-text-muted">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            <span>Finality:</span>
            <span className="font-semibold text-text">~350ms (Sub-second)</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-success" />
            <span>Avg Fee:</span>
            <span className="font-semibold text-text">&lt; $0.0001</span>
          </div>
        </div>

        {/* Right: Ecosystem quick links */}
        <div className="flex items-center gap-3 text-[11px]">
          <a
            href="https://cookieswap.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>Cookieswap</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <div className="h-3 w-px bg-border" />
          <a
            href="https://cookiescan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-text-muted hover:text-text"
          >
            <span>CookieScan</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
