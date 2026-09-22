"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Flame, Sparkles, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KitchenProfile } from "@/hooks/useKitchen";

interface BakeOrderCardProps {
  currentSlot: number;
  profile: KitchenProfile;
  onBake: (
    orderId: number,
    baseScore: number,
    multiplier: number,
  ) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

interface RecipeItem {
  name: string;
  baseScore: number;
  slotsWindow: number;
}

const DEFAULT_RECIPE: RecipeItem = {
  name: "Vanilla Brioche Batch",
  baseScore: 100,
  slotsWindow: 12,
};

const RECIPES: RecipeItem[] = [
  DEFAULT_RECIPE,
  { name: "Golden Croissant Tray", baseScore: 120, slotsWindow: 10 },
  { name: "Sourdough Boule", baseScore: 150, slotsWindow: 14 },
  { name: "Chocolate Macarons", baseScore: 180, slotsWindow: 8 },
  { name: "Pistachio Éclair Set", baseScore: 200, slotsWindow: 10 },
];

export function BakeOrderCard({
  currentSlot,
  profile,
  onBake,
  isSubmitting,
  error,
}: BakeOrderCardProps) {
  // Rotate recipe and target slot window dynamically based on current slot or time
  const activeOrder = useMemo(() => {
    const slotBase =
      currentSlot > 0 ? currentSlot : Math.floor(Date.now() / 1000);
    const recipeIndex = Math.floor(slotBase / 20) % RECIPES.length;
    const recipe: RecipeItem = RECIPES[recipeIndex] ?? DEFAULT_RECIPE;
    const orderId = (slotBase % 90000) + 10000;
    const targetSlot =
      (currentSlot > 0 ? currentSlot : 1000) + recipe.slotsWindow;

    return {
      orderId,
      recipe,
      targetSlot,
    };
  }, [Math.floor(currentSlot / 20)]);

  // Visual countdown progress
  const [progress, setProgress] = useState(78);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 10) return 95;
        return prev - 2;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Multiplier calculation from equipped tool
  const multiplierNumber = useMemo(() => {
    if (profile.equippedToolId === "blast_chiller") return 2.0;
    if (profile.equippedToolId === "stone_deck_oven") return 1.35;
    if (profile.equippedToolId === "steel_whisk") return 1.1;
    return 1.0;
  }, [profile.equippedToolId]);

  const handleBake = async () => {
    try {
      await onBake(
        activeOrder.orderId,
        activeOrder.recipe.baseScore,
        multiplierNumber,
      );
    } catch {
      // Error handled by parent hook
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            <Flame className="h-3.5 w-3.5 fill-primary text-primary animate-pulse" />
            <span>ACTIVE ORDER</span>
          </Badge>

          <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <span className="font-mono font-bold text-text">
              ORDER #{activeOrder.orderId}
            </span>
            <span>•</span>
            <span className="font-mono">
              Target: Slot #
              {currentSlot > 0 ? activeOrder.targetSlot : "Syncing"}
            </span>
          </div>
        </div>

        {/* Recipe Name & Slot Window */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-heading text-xl font-bold tracking-tight text-text sm:text-2xl">
              {activeOrder.recipe.name}
            </h3>
            <span className="text-xs font-medium text-text-muted flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {activeOrder.recipe.slotsWindow} slots window
            </span>
          </div>

          <div className="mt-3">
            <Progress value={progress} className="h-2 w-full" />
          </div>
        </div>

        {/* Stats: Base Score & Speed Multiplier */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="flex flex-col rounded-2xl border border-border/50 bg-accent/30 p-4">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              BASE SCORE
            </span>
            <span className="mt-1 font-heading text-2xl font-black text-text">
              {activeOrder.recipe.baseScore}
            </span>
            <span className="mt-0.5 text-[11px] font-semibold text-text-muted">
              CRUM
            </span>
          </div>

          <div className="flex flex-col rounded-2xl border border-border/50 bg-accent/30 p-4">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              SPEED MULTIPLIER
            </span>
            <span className="mt-1 font-heading text-2xl font-black text-primary">
              {multiplierNumber.toFixed(2)}x
            </span>
            <span className="mt-0.5 text-[11px] font-semibold text-text-muted">
              {profile.equippedToolName}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        )}
      </div>

      {/* Bake Button */}
      <div className="mt-6">
        <Button
          onClick={handleBake}
          disabled={isSubmitting}
          className="h-12 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Baking on Cookie Chain...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Flame className="h-4 w-4 fill-current" />
              <span>BAKE ORDER (SIGN MEMO)</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
