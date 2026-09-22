"use client";

import { useCallback, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createKitchenMemoTx,
  createKitchenEquipTx,
  parseKitchenMemo,
} from "@/lib/kitchen";

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

async function syncToServer(
  wallet: string,
  profile: KitchenProfile,
  receipts: KitchenReceipt[]
) {
  try {
    await fetch(`/api/kitchen/${wallet}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, receipts }),
    });
  } catch (e) {
    console.warn("Failed to sync kitchen state to server API:", e);
  }
}

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

  // Load Kitchen Profile & Receipts: multi-layer (localStorage -> Server API -> On-Chain SVM)
  useEffect(() => {
    if (!walletKey || !connected || !publicKey) {
      setHasKitchen(false);
      setProfile(null);
      setReceipts([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      let loadedProfile: KitchenProfile | null = null;
      let loadedReceipts: KitchenReceipt[] = [];

      // Layer 1: Check Local Storage (instant client cache)
      try {
        const storedProfile = localStorage.getItem(`kn_profile_${walletKey}`);
        const storedReceipts = localStorage.getItem(`kn_receipts_${walletKey}`);

        if (storedProfile) {
          loadedProfile = JSON.parse(storedProfile) as KitchenProfile;
          if (storedReceipts) {
            loadedReceipts = JSON.parse(storedReceipts) as KitchenReceipt[];
          }
        }
      } catch (e) {
        console.warn("Error reading localStorage:", e);
      }

      if (loadedProfile && isMounted) {
        setProfile(loadedProfile);
        setReceipts(loadedReceipts);
        setHasKitchen(true);
        setIsLoading(false);
      }

      // Layer 2: Check Server API (cross-device sync across browsers & devices)
      try {
        const res = await fetch(`/api/kitchen/${walletKey}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.profile) {
            if (
              !loadedProfile ||
              (json.profile.bakesCount || 0) >= (loadedProfile.bakesCount || 0)
            ) {
              loadedProfile = json.profile;
              loadedReceipts = json.receipts || [];

              if (isMounted) {
                setProfile(loadedProfile);
                setReceipts(loadedReceipts);
                setHasKitchen(true);
                setIsLoading(false);
              }

              localStorage.setItem(
                `kn_profile_${walletKey}`,
                JSON.stringify(loadedProfile)
              );
              localStorage.setItem(
                `kn_receipts_${walletKey}`,
                JSON.stringify(loadedReceipts)
              );
            }
          }
        }
      } catch (e) {
        console.warn("Error fetching server profile:", e);
      }

      // Layer 3: Reconstruct & Verify from On-chain Cookie Chain SVM Memo Transactions
      // If user connects on a completely new phone/device with no cached data
      try {
        const sigs = await connection.getSignaturesForAddress(publicKey, {
          limit: 100,
        });

        const memoTxs: {
          slot: number;
          signature: string;
          blockTime: number;
          memo: string;
        }[] = [];

        for (const s of sigs) {
          const cleanMemo = parseKitchenMemo(s.memo);
          if (cleanMemo) {
            memoTxs.push({
              slot: s.slot,
              signature: s.signature,
              blockTime: (s.blockTime || Math.floor(Date.now() / 1000)) * 1000,
              memo: cleanMemo,
            });
          }
        }

        if (memoTxs.length > 0) {
          // Sort chronologically (oldest first)
          memoTxs.sort((a, b) => a.slot - b.slot);

          let kitchenName = loadedProfile?.name || "";
          let createdAt = loadedProfile?.createdAt || Date.now();
          let currentEquippedId =
            loadedProfile?.equippedToolId || "wooden_spoon";
          let bakesCount = 0;
          let netWorth = 0;
          const chainReceipts: KitchenReceipt[] = [];

          for (const tx of memoTxs) {
            if (tx.memo.startsWith("kitchen:v1:open:")) {
              kitchenName = tx.memo.replace("kitchen:v1:open:", "").trim();
              createdAt = tx.blockTime;
              chainReceipts.unshift({
                id: tx.signature,
                slot: tx.slot,
                timestamp: tx.blockTime,
                action: "kitchen:v1:open",
                finalitySpeed: 240,
                crumAwarded: 0,
                signature: tx.signature,
              });
            } else if (tx.memo.startsWith("kitchen:v1:equip:")) {
              const toolId = tx.memo.replace("kitchen:v1:equip:", "").trim();
              currentEquippedId = toolId;
              chainReceipts.unshift({
                id: tx.signature,
                slot: tx.slot,
                timestamp: tx.blockTime,
                action: "kitchen:v1:equip",
                finalitySpeed: 230,
                crumAwarded: 0,
                signature: tx.signature,
              });
            } else if (tx.memo.startsWith("kitchen:v1:bake:")) {
              bakesCount += 1;
              const tool =
                UTENSIL_TOOLS.find((t) => t.id === currentEquippedId) ||
                UTENSIL_TOOLS[0]!;
              const awardedCrum = Math.round(100 * tool.multiplier);
              netWorth += awardedCrum;
              chainReceipts.unshift({
                id: tx.signature,
                slot: tx.slot,
                timestamp: tx.blockTime,
                action: "kitchen:v1:bake",
                finalitySpeed: 250,
                crumAwarded: awardedCrum,
                signature: tx.signature,
              });
            }
          }

          if (kitchenName) {
            const equippedTool =
              UTENSIL_TOOLS.find((t) => t.id === currentEquippedId) ||
              UTENSIL_TOOLS[0]!;

            let level = 1;
            let title = "Commis Chef";
            if (bakesCount >= 25) {
              level = 4;
              title = "Executive Chef";
            } else if (bakesCount >= 10) {
              level = 3;
              title = "Sous Chef";
            } else if (bakesCount >= 3) {
              level = 2;
              title = "Chef de Partie";
            }

            const reconstructedProfile: KitchenProfile = {
              name: kitchenName,
              owner: walletKey,
              level,
              title,
              equippedToolId: equippedTool.id,
              equippedToolName: equippedTool.name,
              equippedToolBoost: `${equippedTool.multiplier.toFixed(1)}x${equippedTool.multiplier === 1.0 ? " (Base)" : ""}`,
              netWorth: Math.max(netWorth, loadedProfile?.netWorth || 0),
              bakesCount: Math.max(bakesCount, loadedProfile?.bakesCount || 0),
              avgLatency: loadedProfile?.avgLatency || 240,
              totalLatencySum:
                loadedProfile?.totalLatencySum || bakesCount * 240,
              createdAt,
            };

            const finalReceipts =
              chainReceipts.length >= loadedReceipts.length
                ? chainReceipts
                : loadedReceipts;

            if (isMounted) {
              setProfile(reconstructedProfile);
              setReceipts(finalReceipts);
              setHasKitchen(true);
            }

            localStorage.setItem(
              `kn_profile_${walletKey}`,
              JSON.stringify(reconstructedProfile)
            );
            localStorage.setItem(
              `kn_receipts_${walletKey}`,
              JSON.stringify(finalReceipts)
            );
            syncToServer(walletKey, reconstructedProfile, finalReceipts);
          }
        }
      } catch (err) {
        console.warn("Could not query on-chain memos:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [walletKey, connected, publicKey, connection]);

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
        const lamports = await connection
          .getBalance(publicKey, "confirmed")
          .catch(() => 0);
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
        const slot = await connection
          .getSlot("confirmed")
          .catch(() => currentSlot || 1);

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

        localStorage.setItem(
          `kn_profile_${publicKey.toBase58()}`,
          JSON.stringify(newProfile)
        );
        localStorage.setItem(
          `kn_receipts_${publicKey.toBase58()}`,
          JSON.stringify(updatedReceipts)
        );

        setProfile(newProfile);
        setReceipts(updatedReceipts);
        setHasKitchen(true);

        syncToServer(publicKey.toBase58(), newProfile, updatedReceipts);
      } catch (err: unknown) {
        let message =
          err instanceof Error ? err.message : "Failed to open kitchen";
        if (message.includes("AccountNotFound")) {
          message =
            "Account Not Found: Your wallet has 0 COOK on Cookie Chain. Please ensure you hold COOK for transaction gas.";
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
    async (
      orderId: number,
      baseScore: number = 100,
      speedMultiplier: number = 1.0
    ) => {
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
        const slot = await connection
          .getSlot("confirmed")
          .catch(() => currentSlot || 1);

        const awardedCrum = Math.round(baseScore * speedMultiplier);
        const newBakesCount = profile.bakesCount + 1;
        const newTotalLatency = profile.totalLatencySum + latency;
        const newAvgLatency = Math.round(newTotalLatency / newBakesCount);
        const newNetWorth = profile.netWorth + awardedCrum;

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

        syncToServer(publicKey.toBase58(), updatedProfile, updatedReceipts);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to bake order";
        setActionError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      connection,
      publicKey,
      connected,
      profile,
      sendTransaction,
      currentSlot,
      receipts,
    ]
  );

  // Equip Tool: Costs actual COOK (transfers lamports on-chain to treasury) except wooden spoon which is free
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
        const lamports = await connection
          .getBalance(publicKey, "confirmed")
          .catch(() => 0);
        const requiredLamports = Math.round(tool.price * LAMPORTS_PER_SOL);

        // Verify balance if tool has a price
        if (tool.price > 0 && lamports < requiredLamports + 10_000) {
          const err = `Insufficient COOK balance. You need at least ${tool.price} COOK to equip ${tool.name}. Your balance: ${(lamports / LAMPORTS_PER_SOL).toFixed(4)} COOK.`;
          setActionError(err);
          throw new Error(err);
        }

        // Build transaction: transfers actual COOK (if price > 0) and records kitchen:v1:equip:<id> memo
        const tx = await createKitchenEquipTx(
          connection,
          publicKey,
          tool.id,
          tool.price
        );
        const signature = await sendTransaction(tx, connection);

        await connection.confirmTransaction(signature, "confirmed");

        const latency = Math.round(performance.now() - startTime);
        const slot = await connection
          .getSlot("confirmed")
          .catch(() => currentSlot || 1);

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

        syncToServer(publicKey.toBase58(), updatedProfile, updatedReceipts);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to equip tool";
        setActionError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      connection,
      publicKey,
      connected,
      profile,
      sendTransaction,
      currentSlot,
      receipts,
    ]
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
