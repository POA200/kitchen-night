"use client";

import React from "react";
import {
  Utensils,
  Flame,
  Snowflake,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KitchenProfile, UTENSIL_TOOLS, UtensilTool } from "@/hooks/useKitchen";

interface PantryToolsContentProps {
  profile: KitchenProfile;
  onEquipTool: (toolId: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

function getToolIcon(iconName: UtensilTool["iconName"]) {
  switch (iconName) {
    case "spoon":
      return <Utensils className="h-6 w-6 text-primary stroke-[1.8]" />;
    case "oven":
      return (
        <Flame className="h-6 w-6 text-primary fill-primary/20 stroke-[1.8]" />
      );
    case "chiller":
      return <Snowflake className="h-6 w-6 text-primary stroke-[1.8]" />;
    case "whisk":
      return <Sparkles className="h-6 w-6 text-primary stroke-[1.8]" />;
    default:
      return <Utensils className="h-6 w-6 text-primary stroke-[1.8]" />;
  }
}

export function PantryToolsContent({
  profile,
  onEquipTool,
  isSubmitting,
  error,
}: PantryToolsContentProps) {
  const handleEquip = async (toolId: string) => {
    try {
      await onEquipTool(toolId);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="flex flex-col">
      {/* Title & Description */}
      <div>
        <h2 className="font-heading text-xl font-black tracking-tight text-text sm:text-2xl">
          Kitchen Pantry & Tools
        </h2>
        <p className="mt-1 text-xs text-text-muted sm:text-sm">
          Equip utensils to boost your bake score and kitchen net worth.
        </p>
      </div>

      {/* Active Equipment Status Banner */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-accent/30 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">
            Active Equipment:
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-xs">
            <Utensils className="h-3 w-3" />
            {profile.equippedToolName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">
            Current Boost:
          </span>
          <span className="inline-flex items-center rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30 font-mono">
            {profile.equippedToolBoost}
          </span>
        </div>
      </div>

      {/* Cookieswap Liquidity Callout */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-text">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium text-text">
            Need $COOK to equip tools?
          </span>
        </div>
        <a
          href="https://cookieswap.fun"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          <span>Get on Cookieswap</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-snug">{error}</p>
        </div>
      )}

      {/* 2x2 Utensils Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {UTENSIL_TOOLS.map((tool) => {
          const isEquipped = profile.equippedToolId === tool.id;
          const unlockedList =
            Array.isArray(profile.unlockedToolIds) &&
            profile.unlockedToolIds.length > 0
              ? profile.unlockedToolIds
              : ["wooden_spoon", profile.equippedToolId];
          const isUnlocked = unlockedList.includes(tool.id) || tool.price === 0;

          return (
            <div
              key={tool.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                isEquipped
                  ? "border-primary/40 bg-primary/5 shadow-xs"
                  : isUnlocked
                    ? "border-primary/20 bg-accent/20 hover:border-border hover:bg-accent/30"
                    : "border-border/70 bg-card hover:border-border hover:bg-accent/20"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/50 border border-border/40 text-primary">
                    {getToolIcon(tool.iconName)}
                  </div>

                  {isEquipped ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary"
                    >
                      Active
                    </Badge>
                  ) : isUnlocked ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-bold text-success flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>Unlocked</span>
                    </Badge>
                  ) : tool.price > 0 ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-accent/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-text-muted"
                    >
                      {tool.price} COOK
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-accent/40 px-2.5 py-0.5 text-[11px] font-bold text-text-muted"
                    >
                      Free
                    </Badge>
                  )}
                </div>

                <div className="mt-3.5">
                  <h4 className="font-heading text-base font-bold text-text">
                    {tool.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {tool.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {isEquipped ? (
                  <Button
                    disabled
                    className="h-10 w-full rounded-xl border border-border bg-accent/50 text-xs font-semibold text-text-muted disabled:opacity-100"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5 text-text-muted" />
                    Equipped ✓
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleEquip(tool.id)}
                    disabled={isSubmitting}
                    className="h-10 w-full rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Equipping...</span>
                      </div>
                    ) : (
                      <span>
                        {isUnlocked
                          ? "Equip (Unlocked)"
                          : `${tool.price} COOK — Equip`}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-3.5 text-center">
        <p className="font-mono text-[11px] text-text-muted">
          Equipping tools submits an on-chain memo:
          kitchen:v1:equip:&lt;tool_id&gt;
        </p>
      </div>
    </div>
  );
}
