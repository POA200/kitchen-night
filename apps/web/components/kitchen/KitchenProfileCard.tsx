"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, User, Utensils, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KitchenProfile } from "@/hooks/useKitchen";

interface KitchenProfileCardProps {
  profile: KitchenProfile;
  onOpenPantry: () => void;
}

export function KitchenProfileCard({
  profile,
  onOpenPantry,
}: KitchenProfileCardProps) {
  const router = useRouter();

  const handlePantryClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      router.push("/pantry");
    } else {
      onOpenPantry();
    }
  };
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs">
      <div>
        {/* Profile Header Row */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-accent/70 text-text shadow-xs">
            <User className="h-6 w-6 stroke-[1.8]" />
          </div>

          <div className="rounded-full border border-border/60 bg-accent/50 px-4 py-1.5 text-xs font-bold text-text">
            {profile.name}
          </div>
        </div>

        {/* Level & Utensil Badges Row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-7 rounded-full border-border/70 bg-accent/40 px-3 text-xs font-semibold text-text"
          >
            <Award className="mr-1 h-3.5 w-3.5 text-primary" />
            Lv. {profile.level} {profile.title}
          </Badge>

          <Badge
            variant="outline"
            className="h-7 rounded-full border-border/70 bg-accent/40 px-3 text-xs font-semibold text-text"
          >
            <Utensils className="mr-1.5 h-3.5 w-3.5 text-primary" />
            {profile.equippedToolName}
          </Badge>
        </div>

        {/* 3-Column Stats Grid */}
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Net Worth */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-accent/30 p-4 text-center">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              NET WORTH
            </span>
            <span className="mt-1 font-heading text-2xl font-black text-text sm:text-3xl">
              {profile.netWorth.toLocaleString()}
            </span>
            <span className="mt-1 text-[11px] font-semibold text-text-muted">
              CRUM
            </span>
          </div>

          {/* Bakes */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-accent/30 p-4 text-center">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              BAKES
            </span>
            <span className="mt-1 font-heading text-2xl font-black text-text sm:text-3xl">
              {profile.bakesCount}
            </span>
            <span className="mt-1 text-[11px] font-medium text-text-muted">
              {profile.bakesCount === 1
                ? "Shift completed"
                : "Shifts completed"}
            </span>
          </div>

          {/* Average Latency */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-accent/30 p-4 text-center">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
              AVG LATENCY
            </span>
            <span className="mt-1 font-heading text-2xl font-black text-text sm:text-3xl">
              {profile.avgLatency > 0 ? `${profile.avgLatency}ms` : "—"}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-text-muted">
              {profile.avgLatency > 0 ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span>Sub-second</span>
                </>
              ) : (
                <span>No bakes yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pantry & Utensils Button */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={handlePantryClick}
          className="flex h-12 w-full items-center justify-between rounded-2xl border-border bg-card px-5 text-sm font-medium text-text shadow-xs transition-colors hover:bg-accent cursor-pointer"
        >
          <span>Pantry & Utensils</span>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
