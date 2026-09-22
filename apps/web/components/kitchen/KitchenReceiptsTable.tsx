"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Receipt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { KitchenReceipt } from "@/hooks/useKitchen";

interface KitchenReceiptsTableProps {
  receipts: KitchenReceipt[];
  currentSlot: number;
}

const ITEMS_PER_PAGE = 10;

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncateSignature(sig: string): string {
  if (!sig || sig.length <= 12) return sig;
  return `${sig.slice(0, 6)}...${sig.slice(-4)}`;
}

export function KitchenReceiptsTable({
  receipts,
  currentSlot,
}: KitchenReceiptsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(receipts.length / ITEMS_PER_PAGE));

  // Reset page if receipts length changes drastically
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReceipts = receipts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs">
      {/* Table Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/60 text-text">
            <Receipt className="h-5 w-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold tracking-tight text-text sm:text-xl">
              LIVE COOKIE CHAIN RECEIPTS
            </h3>
            <p className="text-xs text-text-muted">
              Real-time SVM memo confirmations and sub-second finality proofs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-accent/40 px-3.5 py-1.5 text-xs font-medium text-text-muted">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>
            Current Block:{" "}
            <strong className="font-mono text-text">
              #{currentSlot > 0 ? currentSlot.toLocaleString() : "Syncing..."}
            </strong>
          </span>
        </div>
      </div>

      {/* Receipts Content */}
      <div className="mt-4">
        {receipts.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[200px] flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-accent/40 text-text-muted">
              <Sparkles className="h-7 w-7 text-primary stroke-[1.8]" />
            </div>
            <h4 className="mt-4 font-heading text-base font-bold text-text">
              No Receipts Recorded Yet
            </h4>
            <p className="mt-1 max-w-sm text-xs text-text-muted">
              Complete your first bake shift or equip a utensil to generate
              verifiable on-chain proofs on Cookie Chain!
            </p>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    SLOT / TIME
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    ACTION
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    FINALITY SPEED
                  </TableHead>
                  <TableHead className="text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    CRUM AWARDED
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-bold tracking-wider text-text-muted uppercase">
                    EXPLORER PROOF
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentReceipts.map((receipt) => (
                  <TableRow
                    key={receipt.id}
                    className="border-border/40 hover:bg-accent/30 transition-colors"
                  >
                    {/* Slot / Time */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-text">
                          #{receipt.slot.toLocaleString()}
                        </span>
                        <span className="text-text-muted">•</span>
                        <span className="text-xs text-text-muted">
                          {formatTimeAgo(receipt.timestamp)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-lg border-border/60 bg-accent/50 font-mono text-[11px] font-semibold text-text"
                      >
                        {receipt.action}
                      </Badge>
                    </TableCell>

                    {/* Finality Speed */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-text">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span>{receipt.finalitySpeed}ms</span>
                      </div>
                    </TableCell>

                    {/* CRUM Awarded */}
                    <TableCell>
                      {receipt.crumAwarded > 0 ? (
                        <span className="text-xs font-bold text-primary">
                          +{receipt.crumAwarded} CRUM
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>

                    {/* Explorer Proof */}
                    <TableCell className="text-right">
                      <a
                        href={`https://cookiescan.io/tx/${receipt.signature}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-text hover:text-primary transition-colors hover:underline"
                      >
                        <span>{truncateSignature(receipt.signature)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {receipts.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
            <span className="text-text-muted">
              Showing{" "}
              <strong className="text-text">
                {startIndex + 1}–
                {Math.min(startIndex + ITEMS_PER_PAGE, receipts.length)}
              </strong>{" "}
              of <strong className="text-text">{receipts.length}</strong> receipts
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
