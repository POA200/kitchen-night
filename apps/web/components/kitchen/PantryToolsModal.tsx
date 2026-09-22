"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { KitchenProfile } from "@/hooks/useKitchen";
import { PantryToolsContent } from "./PantryToolsContent";

interface PantryToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: KitchenProfile;
  onEquipTool: (toolId: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export function PantryToolsModal({
  isOpen,
  onClose,
  profile,
  onEquipTool,
  isSubmitting,
  error,
}: PantryToolsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full sm:max-w-2xl md:max-w-3xl rounded-3xl border-border bg-card p-6 sm:p-7 shadow-xl"
        showCloseButton={true}
      >
        <PantryToolsContent
          profile={profile}
          onEquipTool={onEquipTool}
          isSubmitting={isSubmitting}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}
