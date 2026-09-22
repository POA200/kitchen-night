"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ChefHat, Flame, Sparkles, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKitchen } from "@/hooks/useKitchen";
import { OpenKitchenModal } from "@/components/kitchen/OpenKitchenModal";
import { KitchenProfileCard } from "@/components/kitchen/KitchenProfileCard";
import { BakeOrderCard } from "@/components/kitchen/BakeOrderCard";
import { KitchenReceiptsTable } from "@/components/kitchen/KitchenReceiptsTable";
import { PantryToolsModal } from "@/components/kitchen/PantryToolsModal";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const {
    isLoading,
    hasKitchen,
    profile,
    receipts,
    currentSlot,
    isSubmitting,
    actionError,
    openKitchen,
    bakeOrder,
    equipTool,
  } = useKitchen();

  const walletKey = publicKey ? publicKey.toBase58() : null;
  const [isOpenModalManual, setIsOpenModalManual] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [hasPromptedForWallet, setHasPromptedForWallet] = useState<string | null>(null);

  // Auto-open modal ONCE only if confirmed that the connected wallet has NO kitchen
  useEffect(() => {
    if (
      connected &&
      !isLoading &&
      !hasKitchen &&
      walletKey &&
      hasPromptedForWallet !== walletKey
    ) {
      setIsOpenModalManual(true);
      setHasPromptedForWallet(walletKey);
    }
  }, [connected, isLoading, hasKitchen, walletKey, hasPromptedForWallet]);

  // Reset prompt state when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setHasPromptedForWallet(null);
      setIsOpenModalManual(false);
    }
  }, [connected]);

  // STRICT: If a kitchen already exists, NEVER show the Open Kitchen modal
  const showOpenModal = connected && !hasKitchen && isOpenModalManual;

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full bg-background px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* State 1: Wallet Disconnected Empty State */}
        {!connected && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
              <ChefHat className="h-10 w-10 text-primary stroke-[1.8]" />
            </div>

            <h1 className="mt-6 font-heading text-2xl font-black tracking-tight text-text sm:text-3xl">
              Welcome to Kitchen Night
            </h1>

            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
              The real-time SVM bakery arcade on Cookie Chain. Bake on-chain
              shifts, verify sub-second finality receipts, and build your bakery
              empire.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                onClick={() => setVisible(true)}
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet to Enter Kitchen</span>
              </Button>
            </div>
          </div>
        )}

        {/* State 2: Loading State */}
        {connected && isLoading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                </div>
                <Skeleton className="mt-6 h-11 w-full rounded-2xl" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="mt-4 h-4 w-full rounded-full" />
                <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
                <Skeleton className="mt-6 h-12 w-full rounded-2xl" />
              </div>
            </div>

            <div className="lg:col-span-12">
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          </div>
        )}

        {/* State 3: Connected but No Kitchen Initialized */}
        {connected && !isLoading && !hasKitchen && (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 shadow-xs">
              <Sparkles className="h-10 w-10 text-primary stroke-[1.8]" />
            </div>

            <h2 className="mt-6 font-heading text-2xl font-black tracking-tight text-text sm:text-3xl">
              No Kitchen Found
            </h2>

            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
              Your connected wallet does not have a bakery registered on Cookie
              Chain yet. Open your kitchen to start baking shifts!
            </p>

            {actionError && (
              <div className="mt-4 max-w-md rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                {actionError}
              </div>
            )}

            <div className="mt-6">
              <Button
                onClick={() => setIsOpenModalManual(true)}
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
              >
                <Flame className="h-4 w-4 fill-current" />
                <span>Open Your Kitchen</span>
              </Button>
            </div>
          </div>
        )}

        {/* State 4: Connected with Active Kitchen Profile */}
        {connected && !isLoading && hasKitchen && profile && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
              {/* Section 1: Kitchen Profile Card */}
              <div className="lg:col-span-5">
                <KitchenProfileCard
                  profile={profile}
                  onOpenPantry={() => setIsPantryOpen(true)}
                />
              </div>

              {/* Section 2: Bake Order Card */}
              <div className="lg:col-span-7">
                <BakeOrderCard
                  currentSlot={currentSlot}
                  profile={profile}
                  onBake={bakeOrder}
                  isSubmitting={isSubmitting}
                  error={actionError}
                />
              </div>

              {/* Section 3: Live Cookie Chain Receipts Table */}
              <div className="lg:col-span-12">
                <KitchenReceiptsTable
                  receipts={receipts}
                  currentSlot={currentSlot}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Open Kitchen Modal */}
        <OpenKitchenModal
          isOpen={showOpenModal}
          onClose={() => setIsOpenModalManual(false)}
          onOpenKitchen={openKitchen}
          isSubmitting={isSubmitting}
          error={actionError}
        />

        {/* Modal 2: Pantry & Utensils Modal */}
        {profile && (
          <PantryToolsModal
            isOpen={isPantryOpen}
            onClose={() => setIsPantryOpen(false)}
            profile={profile}
            onEquipTool={equipTool}
            isSubmitting={isSubmitting}
            error={actionError}
          />
        )}
      </div>
    </main>
  );
}
