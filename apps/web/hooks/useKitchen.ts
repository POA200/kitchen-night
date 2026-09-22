"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createKitchenMemoTx } from "@/lib/kitchen";

export interface KitchenProfile {
  name: string;
  owner: string;
  level: number;
  title: string;
  equippedToolId: string;
  equippedToolName: string;
  equippedToolBoost: string;
  netWorth: number;
  bakesCount: number;
  avgLatency: number;
  totalLatencySum: number;
  createdAt: number;
}

export interface KitchenReceipt {
  id: string;
  slot: number;
  timestamp: number;
  action: string;
  finalitySpeed: number;
  crumAwarded: number;
  signature: string;
}

export interface UtensilTool {
  id: string;
  name: string;
  subtitle: string;
  multiplier: number;
  price: number;
  iconName: "spoon" | "oven" | "chiller" | "whisk";
}

export const UTENSIL_TOOLS: UtensilTool[] = [
  {
    id: "wooden_spoon",
    name: "Wooden Spoon",
    subtitle: "+0% Multiplier (Starter)",
    multiplier: 1.0,
    price: 0,
    iconName: "spoon",
  },
  {
    id: "stone_deck_oven",
    name: "Stone Deck Oven",
    subtitle: "+35% Score Multiplier",
    multiplier: 1.35,
    price: 0.05,
    iconName: "oven",
  },
  {
    id: "blast_chiller",
    name: "Blast Chiller",
    subtitle: "2.0x Sub-second Bonus",
    multiplier: 2.0,
    price: 0.1,
    iconName: "chiller",
  },
  {
    id: "steel_whisk",
    name: "Steel Whisk",
    subtitle: "+10% Score Multiplier",
    multiplier: 1.1,
    price: 0.02,
    iconName: "whisk",
  },
];

const DEFAULT_PROFILE: Omit<KitchenProfile, "name" | "owner"> = {
  level: 1,
  title: "Commis Chef",
  equippedToolId: "wooden_spoon",
  equippedToolName: "Wooden Spoon",
  equippedToolBoost: "1.0x (Base)",
  netWorth: 0,
  bakesCount: 0,
  avgLatency: 0,
  totalLatencySum: 0,
  createdAt: Date.now(),
};

export function useKitchen() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [isLoading, setIsLoading] = useState(true);
  const [hasKitchen, setHasKitchen] = useState<boolean>(false);
  const [profile, setProfile] = useState<KitchenProfile | null>(null);
  const [receipts, setReceipts] = useState<KitchenReceipt[]>([]);
  const [currentSlot, setCurrentSlot] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const walletKey = publicKey ? publicKey.toBase58() : null;

  // Poll current block slot
  useEffect(() => {
    let mounted = true;

    const fetchSlot = async () => {
      try {
        const slot = await connection.getSlot("confirmed");
        if (mounted) {
          setCurrentSlot(slot);
        }
      } catch {
        // Ignore slot fetch errors
      }
    };

    fetchSlot();
    const interval = setInterval(fetchSlot, 4_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [connection]);

  // Load Kitchen Profile & Receipts for connected wallet
  useEffect(() => {
    if (!walletKey || !connected) {
      setHasKitchen(false);
      setProfile(null);
      setReceipts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const storedProfile = localStorage.getItem(`kn_profile_${walletKey}`);
      const storedReceipts = localStorage.getItem(`kn_receipts_${walletKey}`);

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile) as KitchenProfile;
        setProfile(parsed);
        setHasKitchen(true);
      } else {
        setProfile(null);
        setHasKitchen(false);
      }

      if (storedReceipts) {
        setReceipts(JSON.parse(storedReceipts) as KitchenReceipt[]);
      } else {
        setReceipts([]);
      }
    } catch (e) {
      console.error("Error loading kitchen data:", e);
      setHasKitchen(false);
    } finally {
      setIsLoading(false);
    }
  }, [walletKey, connected]);

  // Open Kitchen
  const openKitchen = useCallback(
    async (kitchenName: string) => {
      if (!publicKey || !connected) {
        throw new Error("Wallet not connected");
      }

      const trimmedName = kitchenName.trim();
      if (!trimmedName) {
        throw new Error("Kitchen name is required");
      }

      setIsSubmitting(true);
      setActionError(null);

      const startTime = performance.now();

      try {
        // Pre-check balance to catch 0-balance uninitialized account
        const lamports = await connection.getBalance(publicKey, "confirmed").catch(() => 0);
        if (lamports === 0) {
          const zeroMsg =
            "Your wallet has 0 COOK on Cookie Chain. In Solana/SVM networks, an account does not exist on-chain until funded with COOK to pay transaction gas (~0.00005 COOK). Please fund your wallet on Cookie Chain.";
          setActionError(zeroMsg);
          throw new Error(zeroMsg);
        }

        const memoString = `kitchen:v1:open:${trimmedName}`;
        const tx = await createKitchenMemoTx(connection, publicKey, memoString);
        const signature = await sendTransaction(tx, connection);

        await connection.confirmTransaction(signature, "confirmed");

        const latency = Math.round(performance.now() - startTime);
        const slot = await connection.getSlot("confirmed").catch(() => currentSlot || 1);

        const newProfile: KitchenProfile = {
          name: trimmedName,
          owner: publicKey.toBase58(),
          ...DEFAULT_PROFILE,
          avgLatency: latency,
          totalLatencySum: latency,
          createdAt: Date.now(),
        };

        const newReceipt: KitchenReceipt = {
          id: signature,
          slot,
          timestamp: Date.now(),
          action: "kitchen:v1:open",
          finalitySpeed: latency,
          crumAwarded: 0,
          signature,
        };

        const updatedReceipts = [newReceipt, ...receipts];

        localStorage.setItem(`kn_profile_${publicKey.toBase58()}`, JSON.stringify(newProfile));
        localStorage.setItem(
          `kn_receipts_${publicKey.toBase58()}`,
          JSON.stringify(updatedReceipts)
        );

        setProfile(newProfile);
        setReceipts(updatedReceipts);
        setHasKitchen(true);
      } catch (err: unknown) {
        let message = err instanceof Error ? err.message : "Failed to open kitchen";
        if (message.includes("AccountNotFound")) {
          message =
            "Account Not Found: Your wallet either has 0 COOK to pay transaction gas on Cookie Chain, or Nightly is set to the wrong network. Make sure Cookie Chain is selected in Nightly and your wallet holds COOK.";
        }
        setActionError(message);
        throw new Error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [connection, publicKey, connected, sendTransaction, currentSlot, receipts]
  );

  // Bake Order
  const bakeOrder = useCallback(
    async (orderId: number, baseScore: number = 100, speedMultiplier: number = 1.0) => {
      if (!publicKey || !connected || !profile) {
        throw new Error("Kitchen not initialized");
      }

      setIsSubmitting(true);
      setActionError(null);

      const startTime = performance.now();

      try {
        const memoString = `kitchen:v1:bake:${orderId}`;
        const tx = await createKitchenMemoTx(connection, publicKey, memoString);
        const signature = await sendTransaction(tx, connection);

        await connection.confirmTransaction(signature, "confirmed");

        const latency = Math.round(performance.now() - startTime);
        const slot = await connection.getSlot("confirmed").catch(() => currentSlot || 1);

        // Calculate CRUM reward
        const awardedCrum = Math.round(baseScore * speedMultiplier);
        const newBakesCount = profile.bakesCount + 1;
        const newTotalLatency = profile.totalLatencySum + latency;
        const newAvgLatency = Math.round(newTotalLatency / newBakesCount);
        const newNetWorth = profile.netWorth + awardedCrum;

        // Upgrade title based on bakes
        let level = 1;
        let title = "Commis Chef";
        if (newBakesCount >= 25) {
          level = 4;
          title = "Executive Chef";
        } else if (newBakesCount >= 10) {
          level = 3;
          title = "Sous Chef";
        } else if (newBakesCount >= 3) {
          level = 2;
          title = "Chef de Partie";
        }

        const updatedProfile: KitchenProfile = {
          ...profile,
          level,
          title,
          bakesCount: newBakesCount,
          netWorth: newNetWorth,
          avgLatency: newAvgLatency,
          totalLatencySum: newTotalLatency,
        };

        const newReceipt: KitchenReceipt = {
          id: signature,
          slot,
          timestamp: Date.now(),
          action: "kitchen:v1:bake",
          finalitySpeed: latency,
          crumAwarded: awardedCrum,
          signature,
        };

        const updatedReceipts = [newReceipt, ...receipts];

        localStorage.setItem(
          `kn_profile_${publicKey.toBase58()}`,
          JSON.stringify(updatedProfile)
        );
        localStorage.setItem(
          `kn_receipts_${publicKey.toBase58()}`,
          JSON.stringify(updatedReceipts)
        );

        setProfile(updatedProfile);
        setReceipts(updatedReceipts);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to bake order";
        setActionError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [connection, publicKey, connected, profile, sendTransaction, currentSlot, receipts]
  );

  // Equip Tool
  const equipTool = useCallback(
    async (toolId: string) => {
      if (!publicKey || !connected || !profile) {
        throw new Error("Kitchen not initialized");
      }

      const tool = UTENSIL_TOOLS.find((t) => t.id === toolId);
      if (!tool) {
        throw new Error("Invalid tool selected");
      }

      setIsSubmitting(true);
      setActionError(null);

      const startTime = performance.now();

      try {
        const memoString = `kitchen:v1:equip:${tool.id}`;
        const tx = await createKitchenMemoTx(connection, publicKey, memoString);
        const signature = await sendTransaction(tx, connection);

        await connection.confirmTransaction(signature, "confirmed");

        const latency = Math.round(performance.now() - startTime);
        const slot = await connection.getSlot("confirmed").catch(() => currentSlot || 1);

        const updatedProfile: KitchenProfile = {
          ...profile,
          equippedToolId: tool.id,
          equippedToolName: tool.name,
          equippedToolBoost: `${tool.multiplier.toFixed(1)}x${tool.multiplier === 1.0 ? " (Base)" : ""}`,
        };

        const newReceipt: KitchenReceipt = {
          id: signature,
          slot,
          timestamp: Date.now(),
          action: `kitchen:v1:equip`,
          finalitySpeed: latency,
          crumAwarded: 0,
          signature,
        };

        const updatedReceipts = [newReceipt, ...receipts];

        localStorage.setItem(
          `kn_profile_${publicKey.toBase58()}`,
          JSON.stringify(updatedProfile)
        );
        localStorage.setItem(
          `kn_receipts_${publicKey.toBase58()}`,
          JSON.stringify(updatedReceipts)
        );

        setProfile(updatedProfile);
        setReceipts(updatedReceipts);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to equip tool";
        setActionError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [connection, publicKey, connected, profile, sendTransaction, currentSlot, receipts]
  );

  return {
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
  };
}

