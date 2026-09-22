"use client";

import React, { useState } from "react";
import { Flame, CookingPot, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OpenKitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKitchen: (name: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export function OpenKitchenModal({
  isOpen,
  onClose,
  onOpenKitchen,
  isSubmitting,
  error,
}: OpenKitchenModalProps) {
  const [kitchenName, setKitchenName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = kitchenName.trim();
    if (!trimmed) {
      setValidationError("Please enter a kitchen name");
      return;
    }

    if (trimmed.length > 16) {
      setValidationError("Kitchen name must be 16 characters or less");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setValidationError("No spaces or special symbols allowed");
      return;
    }

    setValidationError(null);

    try {
      await onOpenKitchen(trimmed);
      setKitchenName("");
      onClose();
    } catch {
      // Error handled by parent hook
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl outline-none"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center text-center"
        >
          {/* Top Oven / Kitchen Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-xs">
            <CookingPot className="h-8 w-8 stroke-[2.2]" />
          </div>

          {/* Title & Description */}
          <DialogTitle className="font-heading text-xl font-black tracking-tight text-text sm:text-2xl">
            Open Your Kitchen
          </DialogTitle>

          <DialogDescription className="mt-2 text-xs leading-relaxed text-text-muted sm:text-sm">
            Register your on-chain bakery on Cookie Chain. This initializes your
            permanent baker profile.
          </DialogDescription>

          {/* Form Input Section */}
          <div className="mt-6 flex w-full flex-col text-left">
            <label
              htmlFor="kitchen-name"
              className="mb-1.5 text-[11px] font-bold tracking-wider text-text-muted uppercase"
            >
              Kitchen Name / Slug:
            </label>

            <Input
              id="kitchen-name"
              type="text"
              value={kitchenName}
              onChange={(e) => {
                setKitchenName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              maxLength={16}
              disabled={isSubmitting}
              placeholder="eg. MyBakery"
              className="h-11 rounded-xl border border-input bg-background/50 px-3.5 text-sm text-text placeholder:text-text-muted/60 focus-visible:ring-primary/40"
            />

            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-text-muted">
                Max 16 characters. No spaces or special symbols.
              </span>
              <span className="font-mono text-text-muted/80">
                {kitchenName.length}/16
              </span>
            </div>

            {validationError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Gas Estimate Notice Box */}
          <div className="mt-4 w-full rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary">
            Registration Fee: ~0.00005 COOK (Standard network gas)
          </div>

          {/* Action / Network Error Notice */}
          {error && (
            <div className="mt-3 flex w-full flex-col gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-left text-xs text-destructive leading-relaxed">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <a
                href="https://docs.cookiechain.wtf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 self-start font-semibold text-text underline underline-offset-2 hover:opacity-80"
              >
                View Cookie Chain Bridge Guide →
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <Button
              type="submit"
              disabled={isSubmitting || !kitchenName.trim()}
              className="h-11 w-full justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Kitchen (Signing Memo)...</span>
                </>
              ) : (
                <>
                  <Flame className="h-4 w-4 fill-current" />
                  <span>Open Kitchen (Sign Memo)</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-10 w-full justify-center rounded-xl border-border bg-accent/30 text-sm font-medium text-text transition-colors hover:bg-accent cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
