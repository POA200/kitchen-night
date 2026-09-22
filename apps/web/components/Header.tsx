"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, LogOut, Menu, Wallet, X } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BridgeGuideModal } from "@/components/kitchen/BridgeGuideModal";

export const COOK_MINT = new PublicKey(
  "36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1",
);
export const LAMPORTS_PER_COOK = 1_000_000_000;

export function Header() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);

  // Fetch COOK token / native balance
  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    let mounted = true;

    const fetchBalance = async () => {
      try {
        // Native COOK balance on Cookie Chain (native gas token has 9 decimals)
        const lamports = await connection.getBalance(publicKey, "confirmed");
        let cookBalance = lamports / LAMPORTS_PER_COOK;

        // Check SPL token account if native balance is 0 or to verify SPL account
        if (cookBalance === 0) {
          try {
            const tokenAccounts =
              await connection.getParsedTokenAccountsByOwner(
                publicKey,
                { mint: COOK_MINT },
                "confirmed",
              );
            const tokenAmount =
              tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount
                .uiAmount;
            if (typeof tokenAmount === "number" && tokenAmount > 0) {
              cookBalance = tokenAmount;
            }
          } catch {
            // Ignore SPL fetch failure and keep native balance
          }
        }

        if (mounted) {
          setBalance(cookBalance);
        }
      } catch (error) {
        console.error("Failed to fetch COOK balance:", error);
      }
    };

    fetchBalance();

    const interval = setInterval(fetchBalance, 10_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  const walletAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  const formatCookBalance = (val: number | null) => {
    if (val === null) return "0.000 COOK";
    return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} COOK`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-16">
        {/* ─────────────────────────────────────────────
            LEFT — BRAND
        ───────────────────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {/* Logo */}
          <Image
            src="/kitchen-night-logo.svg"
            alt="Kitchen Night logo"
            width={40}
            height={40}
            priority
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg border border-border/45"
          />

          {/* Brand Name */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-black tracking-tight text-text sm:text-lg">
              KITCHEN
            </span>

            <span className="font-black tracking-tight text-primary sm:text-lg">
              NIGHT
            </span>
          </div>

          {/* Cookie Chain Badge - Desktop only */}
          <Badge
            variant="outline"
            className="hidden rounded-full border-success bg-success/10 text-success md:inline-flex"
          >
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Cookie Chain
          </Badge>
        </div>

        {/* ─────────────────────────────────────────────
            CENTER — BRIDGE & ECOSYSTEM (Desktop only)
        ───────────────────────────────────────────── */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 md:flex md:items-center md:gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBridgeModalOpen(true)}
            className="h-9 rounded-full border-border bg-card px-4 text-xs font-medium text-text shadow-xs transition-colors hover:bg-accent cursor-pointer"
          >
            <span>Bridge Guide</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a
                href="https://cookieswap.fun"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="h-9 rounded-full border-primary/30 bg-primary/5 px-4 text-xs font-semibold text-primary shadow-xs transition-colors hover:bg-primary/10 cursor-pointer"
          >
            <span>Cookieswap</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* ─────────────────────────────────────────────
            RIGHT — WALLET CONTROLS
        ───────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {connected && publicKey ? (
            <>
              {/* Wallet Balance (visible on both mobile and desktop) */}
              <div className="rounded-full bg-accent px-3 py-1.5 font-mono text-xs font-semibold tracking-wide text-text sm:px-3.5">
                {formatCookBalance(balance)}
              </div>

              {/* Desktop connected address button */}
              <div className="hidden md:block">
                <Button
                  onClick={() => disconnect()}
                  className="h-9 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer sm:px-4"
                >
                  <span className="font-mono">{walletAddress}</span>
                  <LogOut className="h-3.5 w-3.5 stroke-[2.2]" />
                </Button>
              </div>

              {/* Mobile Hamburger Trigger & Slide-out Menu Panel */}
              <div className="md:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open menu"
                        className="h-9 w-9 rounded-full text-text hover:bg-accent cursor-pointer"
                      />
                    }
                  >
                    <Menu className="h-5 w-5" />
                  </SheetTrigger>

                  <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l border-border bg-card p-0 shadow-2xl"
                  >
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Mobile navigation and connected wallet controls
                    </SheetDescription>

                    {/* Top bar with Logo on left and X close button on right */}
                    <div className="flex h-16 items-center justify-between border-b border-border px-6">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src="/kitchen-night-logo.svg"
                          alt="Kitchen Night logo"
                          width={36}
                          height={36}
                          className="h-9 w-9 shrink-0 rounded-xl border border-border shadow-xs"
                        />
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="font-black tracking-tight text-text text-base">
                            KITCHEN
                          </span>
                          <span className="font-black tracking-tight text-primary text-base">
                            NIGHT
                          </span>
                        </div>
                      </div>

                      <SheetClose
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close menu"
                            className="h-9 w-9 rounded-full text-text-muted hover:bg-accent hover:text-text cursor-pointer"
                          />
                        }
                      >
                        <X className="h-5 w-5" />
                      </SheetClose>
                    </div>

                    {/* Menu Panel Content */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex flex-col gap-4">
                        {/* Connected Wallet Info Card */}
                        <div className="flex items-center justify-between rounded-xl border border-border bg-accent/40 p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-medium text-text-muted">
                              Connected Wallet
                            </span>
                            <span className="font-mono text-xs font-semibold text-text">
                              {walletAddress}
                            </span>
                          </div>
                          <div className="rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-semibold text-text">
                            {formatCookBalance(balance)}
                          </div>
                        </div>

                        {/* Bridge Guide Button (w-full) */}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsBridgeModalOpen(true);
                          }}
                          className="h-11 w-full justify-center rounded-xl border-border bg-card text-sm font-medium text-text shadow-xs transition-colors hover:bg-accent cursor-pointer"
                        >
                          <span>Bridge Guide</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>

                        {/* Cookieswap Button (w-full) */}
                        <Button
                          variant="outline"
                          nativeButton={false}
                          render={
                            <a
                              href="https://cookieswap.fun"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsMobileMenuOpen(false)}
                            />
                          }
                          className="h-11 w-full justify-center rounded-xl border-primary/30 bg-primary/5 text-sm font-semibold text-primary shadow-xs transition-colors hover:bg-primary/10 cursor-pointer"
                        >
                          <span>Trade on Cookieswap</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>

                        {/* Disconnect Button (w-full) */}
                        <Button
                          variant="destructive"
                          onClick={() => {
                            disconnect();
                            setIsMobileMenuOpen(false);
                          }}
                          className="h-11 w-full justify-center rounded-xl text-sm font-semibold shadow-xs cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Disconnect</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            /* Disconnected — Connect Nightly Button on far right */
            <Button
              onClick={() => setVisible(true)}
              className="h-9 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 cursor-pointer sm:px-5 sm:text-sm"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Nightly</span>
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Bridge & Ecosystem Modal */}
      <BridgeGuideModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
      />
    </header>
  );
}
