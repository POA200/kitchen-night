"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Zap,
  Coins,
  ArrowRight,
  Check,
  Copy,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BridgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BridgeGuideModal({ isOpen, onClose }: BridgeGuideModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-3xl border-border bg-card p-6 shadow-2xl sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold tracking-tight text-text sm:text-xl">
                Bridge & Cookie Ecosystem Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                How to fund your Nightly wallet and explore Cookie Chain SVM
              </DialogDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="hidden sm:inline-flex rounded-full border-success bg-success/10 text-success text-[10px] font-semibold"
          >
            Sub-Second SVM
          </Badge>
        </div>

        {/* 3 Step Bridge Guide */}
        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            3-Step Quick Start
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-2xl border border-border bg-accent/30 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary">
                    STEP 1
                  </span>
                  <Coins className="h-3.5 w-3.5 text-text-muted" />
                </div>
                <h4 className="mt-1 font-heading text-xs font-bold text-text">
                  Get SOL / USDC
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                  Ensure your Nightly wallet has SOL or USDC on Solana mainnet.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary">
                    STEP 2
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </div>
                <h4 className="mt-1 font-heading text-xs font-bold text-text">
                  Bridge to Cookie
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                  Deposit via the bridge to receive native $COOK on Cookie
                  Chain.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-border bg-accent/30 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary">
                    STEP 3
                  </span>
                  <Zap className="h-3.5 w-3.5 text-text-muted" />
                </div>
                <h4 className="mt-1 font-heading text-xs font-bold text-text">
                  Swap & Bake
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                  Use Cookieswap for liquidity and start baking in Kitchen
                  Night!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Specs Box with One-Click Copy */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Network Configuration
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Solana VM Compatible
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2">
              <span className="text-text-muted text-[11px]">RPC Endpoint</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard("https://rpc.cookiescan.io", "rpc")
                }
                className="flex items-center gap-1 font-mono text-[11px] font-medium text-text hover:text-primary transition-colors cursor-pointer"
              >
                {copiedField === "rpc" ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                rpc.cookiescan.io
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2">
              <span className="text-text-muted text-[11px]">Gas Token</span>
              <span className="font-mono text-[11px] font-bold text-primary">
                $COOK (9 decimals)
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2 sm:col-span-2">
              <span className="text-text-muted text-[11px]">Genesis Hash</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    "9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2",
                    "genesis",
                  )
                }
                className="flex items-center gap-1 font-mono text-[10px] text-text hover:text-primary transition-colors cursor-pointer truncate max-w-[240px]"
              >
                {copiedField === "genesis" ? (
                  <Check className="h-3 w-3 text-success shrink-0" />
                ) : (
                  <Copy className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">9wDaBRDgArE...2EoEcBB2</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Links / Buttons */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button
            nativeButton={false}
            render={
              <a
                href="https://docs.cookiechain.wtf"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="flex-1 h-11 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer"
          >
            <span>Cookie Bridge Docs</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://cookieswap.fun"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="flex-1 h-11 rounded-xl border-border bg-accent/40 text-xs font-semibold text-text hover:bg-accent cursor-pointer"
          >
            <span>Trade on Cookieswap</span>
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://cookiescan.io"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="h-11 rounded-xl border-border bg-card text-xs font-medium text-text-muted hover:text-text cursor-pointer"
          >
            <span>Explorer</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
