"use client";

import Link from "next/link";
import { ArrowLeft, ChefHat, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKitchen } from "@/hooks/useKitchen";
import { PantryToolsContent } from "@/components/kitchen/PantryToolsContent";

export default function PantryPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const {
    isLoading,
    hasKitchen,
    profile,
    isSubmitting,
    actionError,
    equipTool,
  } = useKitchen();

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full bg-background px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back Navigation Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-text shadow-xs transition-colors hover:bg-accent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Kitchen</span>
          </Link>
        </div>

        {/* State 1: Wallet Disconnected */}
        {!connected && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-xs">
              <ChefHat className="h-8 w-8 text-primary stroke-[1.8]" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-black tracking-tight text-text sm:text-2xl">
              Connect Wallet
            </h2>
            <p className="mt-2 max-w-sm text-xs text-text-muted">
              Connect your wallet to inspect your kitchen utensils and equip
              multiplier boosts.
            </p>
            <Button
              onClick={() => setVisible(true)}
              className="mt-6 h-10 rounded-full bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5 mr-2" />
              <span>Connect Wallet</span>
            </Button>
          </div>
        )}

        {/* State 2: Loading State */}
        {connected && isLoading && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
            <Skeleton className="mt-6 h-16 w-full rounded-2xl" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </div>
          </div>
        )}

        {/* State 3: Connected & No Kitchen Found */}
        {connected && !isLoading && !hasKitchen && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xs">
            <h3 className="font-heading text-lg font-bold text-text">
              No Kitchen Found
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              You must register a bakery on Cookie Chain before accessing the pantry.
            </p>
            <div className="mt-5">
              <Link href="/">
                <Button className="rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground">
                  Open Kitchen on Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Active Kitchen & Utensils */}
        {connected && !isLoading && hasKitchen && profile && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
            <PantryToolsContent
              profile={profile}
              onEquipTool={equipTool}
              isSubmitting={isSubmitting}
              error={actionError}
            />
          </div>
        )}
      </div>
    </main>
  );
}
