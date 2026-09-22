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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KitchenProfile, UTENSIL_TOOLS, UtensilTool } from "@/hooks/useKitchen";

interface PantryToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: KitchenProfile;
  onEquipTool: (toolId: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

function getToolIcon(iconName: UtensilTool["iconName"]) {
  switch (iconName) {
    case "spoon":
      return <Utensils className="h-5 w-5 text-primary stroke-[1.8]" />;
    case "oven":
      return (
        <Flame className="h-5 w-5 text-amber-500 fill-amber-500/20 stroke-[1.8]" />
      );
    case "chiller":
      return <Snowflake className="h-5 w-5 text-sky-400 stroke-[1.8]" />;
    case "whisk":
      return <Sparkles className="h-5 w-5 text-purple-400 stroke-[1.8]" />;
    default:
      return <Utensils className="h-5 w-5 text-primary stroke-[1.8]" />;
  }
}

export function PantryToolsModal({
  isOpen,
  onClose,
  profile,
  onEquipTool,
  isSubmitting,
  error,
}: PantryToolsModalProps) {
  const handleEquip = async (toolId: string) => {
    try {
      await onEquipTool(toolId);
    } catch {
      // Error handled by parent hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-xl rounded-3xl border-border bg-card p-6 sm:p-8 shadow-xl"
        showCloseButton={true}
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="font-heading text-xl font-bold tracking-tight text-text sm:text-2xl">
            Pantry & Utensils
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted sm:text-sm">
            Equip kitchen utensils to boost your CRUM score multiplier on each
            bake shift.
          </DialogDescription>
        </div>

        {/* Active Equipment Status Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              ACTIVE EQUIPMENT
            </span>
            <div className="mt-0.5 font-heading text-base font-bold text-text">
              {profile.equippedToolName}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              CURRENT BOOST
            </span>
            <div className="mt-0.5 font-mono text-sm font-bold text-primary">
              {profile.equippedToolBoost}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-2 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {/* 2x2 Utensils Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {UTENSIL_TOOLS.map((tool) => {
            const isEquipped = profile.equippedToolId === tool.id;

            return (
              <div
                key={tool.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                  isEquipped
                    ? "border-primary/40 bg-primary/5 shadow-xs"
                    : "border-border/60 bg-accent/20 hover:border-border hover:bg-accent/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/50 shadow-xs">
                      {getToolIcon(tool.iconName)}
                    </div>
                    {tool.price > 0 ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-bold border-border/60 text-text-muted"
                      >
                        {tool.price} COOK
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-border/60 text-text-muted"
                      >
                        Free
                      </Badge>
                    )}
                  </div>

                  <h4 className="mt-3 font-heading text-sm font-bold text-text">
                    {tool.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {tool.subtitle}
                  </p>
                </div>

                <div className="mt-4">
                  {isEquipped ? (
                    <Button
                      disabled
                      className="h-10 w-full rounded-xl border border-primary/20 bg-primary/10 text-xs font-semibold text-primary disabled:opacity-100"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Equipped
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEquip(tool.id)}
                      disabled={isSubmitting}
                      className="h-10 w-full rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Equipping...</span>
                        </div>
                      ) : (
                        <span>
                          {tool.price > 0
                            ? `${tool.price} COOK — Equip`
                            : "Equip (Free)"}
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Info */}
        <div className="mt-2 text-center">
          <p className="font-mono text-[11px] text-text-muted">
            Equipping tools submits an on-chain memo: kitchen:v1:equip:&lt;tool_id&gt;
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
