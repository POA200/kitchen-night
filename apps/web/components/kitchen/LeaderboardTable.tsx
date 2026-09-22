"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Utensils,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { LeaderboardEntry } from "@/app/api/leaderboard/route";

interface LeaderboardTableProps {
  connectedWalletKey?: string | null;
  currentUserProfile?: {
    name: string;
    level: number;
    title: string;
    equippedToolName: string;
    bakesCount: number;
    netWorth: number;
  } | null;
}

const ITEMS_PER_PAGE = 10;

function truncateAddress(addr: string): string {
  if (!addr || addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function LeaderboardTable({
  connectedWalletKey,
  currentUserProfile,
}: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leaderboard)) {
          let list: LeaderboardEntry[] = data.leaderboard;

          // If the connected user has an active profile, ensure they are present or up-to-date in the list
          if (connectedWalletKey && currentUserProfile) {
            const existingIndex = list.findIndex(
              (p) => p.owner === connectedWalletKey || p.name.toLowerCase() === currentUserProfile.name.toLowerCase()
            );

            const userEntry: LeaderboardEntry = {
              rank: 0,
              name: currentUserProfile.name,
              owner: connectedWalletKey,
              level: currentUserProfile.level,
              title: currentUserProfile.title,
              equippedToolId: "",
              equippedToolName: currentUserProfile.equippedToolName,
              bakesCount: currentUserProfile.bakesCount,
              netWorth: currentUserProfile.netWorth,
            };

            if (existingIndex >= 0) {
              list[existingIndex] = {
                ...list[existingIndex],
                ...userEntry,
              };
            } else {
              list.push(userEntry);
            }

            // Re-sort and re-rank
            list.sort((a, b) => {
              if (b.netWorth !== a.netWorth) return b.netWorth - a.netWorth;
              return b.bakesCount - a.bakesCount;
            });

            list = list.slice(0, 50).map((item, idx) => ({
              ...item,
              rank: idx + 1,
            }));
          }

          setEntries(list);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch leaderboard:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [connectedWalletKey, currentUserProfile?.netWorth, currentUserProfile?.bakesCount]);

  const totalPages = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntries = entries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/60 text-primary">
            <Trophy className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold tracking-tight text-text sm:text-xl">
              COOKIE CHAIN BAKER LEADERBOARD
            </h3>
            <p className="text-xs text-text-muted">
              Top 50 bakeries ranked by total CRUM net worth and baking shifts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="h-8 w-8 rounded-full text-text-muted hover:text-text cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-accent/40 px-3.5 py-1.5 text-xs font-semibold text-text">
            <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Top 50 Bakers</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Content */}
      <div className="mt-4">
        {isLoading && entries.length === 0 ? (
          /* Loading Skeletons */
          <div className="space-y-3 py-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-border/40 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-24 rounded-lg" />
                  <Skeleton className="h-6 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[200px] flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-accent/40 text-text-muted">
              <Sparkles className="h-7 w-7 text-primary stroke-[1.8]" />
            </div>
            <h4 className="mt-4 font-heading text-base font-bold text-text">
              No Bakeries Ranked Yet
            </h4>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              Be the first chef to open a kitchen and bake shifts on Cookie Chain
              to take the #1 crown!
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-16 text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    RANK
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    BAKERY / CHEF
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    RANK / TITLE
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    EQUIPPED UTENSIL
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    SHIFTS BAKED
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    CRUM NET WORTH
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEntries.map((player) => {
                  const isCurrentUser =
                    connectedWalletKey &&
                    (player.owner === connectedWalletKey ||
                      (currentUserProfile &&
                        player.name.toLowerCase() ===
                          currentUserProfile.name.toLowerCase()));

                  return (
                    <TableRow
                      key={`${player.rank}-${player.name}-${player.owner}`}
                      className={`border-border/40 transition-colors ${
                        isCurrentUser
                          ? "bg-primary/10 hover:bg-primary/15 font-semibold"
                          : "hover:bg-accent/30"
                      }`}
                    >
                      {/* Rank Column */}
                      <TableCell className="font-medium">
                        {player.rank === 1 ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs shadow-xs">
                            <Crown className="h-4 w-4 fill-amber-500" />
                          </div>
                        ) : player.rank === 2 ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300/30 text-slate-300 font-bold text-xs">
                            <Medal className="h-4 w-4" />
                          </div>
                        ) : player.rank === 3 ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700/25 text-amber-600 font-bold text-xs">
                            <Medal className="h-4 w-4" />
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-bold text-text-muted pl-1.5">
                            #{player.rank}
                          </span>
                        )}
                      </TableCell>

                      {/* Bakery / Chef Column */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/70 text-text">
                            <User className="h-3.5 w-3.5 stroke-[2]" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text">
                                {player.name}
                              </span>
                              {isCurrentUser && (
                                <Badge className="h-4 rounded-full bg-primary px-1.5 text-[9px] font-bold text-primary-foreground">
                                  You
                                </Badge>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-text-muted">
                              {truncateAddress(player.owner)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Rank / Title Column */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-6 rounded-lg border-border/70 bg-accent/40 px-2 text-[11px] font-medium text-text"
                        >
                          <Award className="mr-1 h-3 w-3 text-primary" />
                          Lv. {player.level} {player.title}
                        </Badge>
                      </TableCell>

                      {/* Equipped Utensil Column */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-6 rounded-lg border-border/70 bg-accent/40 px-2 text-[11px] font-medium text-text"
                        >
                          <Utensils className="mr-1 h-3 w-3 text-primary" />
                          {player.equippedToolName}
                        </Badge>
                      </TableCell>

                      {/* Shifts Baked Column */}
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-text">
                          {player.bakesCount}
                        </span>
                        <span className="text-xs text-text-muted ml-1">
                          {player.bakesCount === 1 ? "shift" : "shifts"}
                        </span>
                      </TableCell>

                      {/* CRUM Net Worth Column */}
                      <TableCell className="text-right">
                        <span className="font-heading text-sm font-black text-primary">
                          {player.netWorth.toLocaleString()}
                        </span>
                        <span className="ml-1 text-[11px] font-semibold text-text-muted">
                          CRUM
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {entries.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
            <span className="text-text-muted">
              Showing{" "}
              <strong className="text-text">
                {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, entries.length)}
              </strong>{" "}
              of <strong className="text-text">{entries.length}</strong> top bakers
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-xl border-border px-2.5 text-xs font-semibold text-text hover:bg-accent disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                <span>Prev</span>
              </Button>

              <div className="flex items-center gap-1 px-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-text-muted hover:bg-accent hover:text-text"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-xl border-border px-2.5 text-xs font-semibold text-text hover:bg-accent disabled:opacity-40 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
