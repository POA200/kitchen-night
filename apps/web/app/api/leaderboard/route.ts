import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Connection, PublicKey } from "@solana/web3.js";
import { COOKIE_CHAIN_RPC, MEMO_PROGRAM_ID, parseKitchenMemo } from "@/lib/kitchen";

const DATA_DIR = path.join(process.cwd(), ".data", "kitchens");

export interface LeaderboardEntry {
  rank: number;
  name: string;
  owner: string;
  level: number;
  title: string;
  equippedToolId: string;
  equippedToolName: string;
  bakesCount: number;
  netWorth: number;
}

export async function GET() {
  try {
    const playersMap = new Map<string, LeaderboardEntry>();

    // 1. Read all locally stored profiles from server .data/kitchens/
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const files = await fs.readdir(DATA_DIR);

      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const filePath = path.join(DATA_DIR, file);
          const raw = await fs.readFile(filePath, "utf-8");
          const parsed = JSON.parse(raw);
          const p = parsed.profile;
          if (p && p.name && p.owner) {
            playersMap.set(p.owner, {
              rank: 0,
              name: p.name,
              owner: p.owner,
              level: p.level || 1,
              title: p.title || "Commis Chef",
              equippedToolId: p.equippedToolId || "wooden_spoon",
              equippedToolName: p.equippedToolName || "Wooden Spoon",
              bakesCount: p.bakesCount || 0,
              netWorth: p.netWorth || 0,
            });
          }
        } catch {
          // Ignore parse errors on individual files
        }
      }
    } catch {
      // Ignore if dir doesn't exist
    }

    // 2. Fetch recent on-chain memos from Cookie Chain to pick up active on-chain bakeries
    try {
      const connection = new Connection(COOKIE_CHAIN_RPC, "confirmed");
      const sigs = await connection.getSignaturesForAddress(MEMO_PROGRAM_ID, {
        limit: 100,
      });

      for (const s of sigs) {
        const cleanMemo = parseKitchenMemo(s.memo);
        if (!cleanMemo) continue;

        if (cleanMemo.startsWith("kitchen:v1:open:")) {
          const name = cleanMemo.replace("kitchen:v1:open:", "").trim();
          // If we haven't tracked this name yet or have a partial entry
          let exists = false;
          for (const player of playersMap.values()) {
            if (player.name.toLowerCase() === name.toLowerCase()) {
              exists = true;
              break;
            }
          }
          if (!exists && name) {
            const tempKey = `chain_${name}`;
            playersMap.set(tempKey, {
              rank: 0,
              name,
              owner: s.signature.slice(0, 10),
              level: 1,
              title: "Commis Chef",
              equippedToolId: "wooden_spoon",
              equippedToolName: "Wooden Spoon",
              bakesCount: 0,
              netWorth: 0,
            });
          }
        }
      }
    } catch (err) {
      console.warn("Could not query Cookie Chain memos for leaderboard:", err);
    }

    // 3. Sort players by Net Worth descending, then Bakes descending
    const sorted = Array.from(playersMap.values()).sort((a, b) => {
      if (b.netWorth !== a.netWorth) {
        return b.netWorth - a.netWorth;
      }
      return b.bakesCount - a.bakesCount;
    });

    // 4. Assign ranks and limit to top 50
    const top50: LeaderboardEntry[] = sorted.slice(0, 50).map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      totalPlayers: sorted.length,
      leaderboard: top50,
    });
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate leaderboard" },
      { status: 500 }
    );
  }
}

