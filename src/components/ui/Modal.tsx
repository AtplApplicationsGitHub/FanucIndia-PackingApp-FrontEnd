// src/components/ui/Modal.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
        <DialogContent className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-zinc-900 text-black dark:text-white p-6 shadow-lg border border-zinc-200 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-4">{children}</div>
          <DialogClose asChild>
            <button
              className="absolute right-4 top-4 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
              type="button"
            >
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
