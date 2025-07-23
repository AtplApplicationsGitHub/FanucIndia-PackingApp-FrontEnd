"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
};

export default function ConfirmDeleteDialog({
  open,
  onConfirm,
  onCancel,
  loading = false,
  title = "Delete Order",
  description = "Are you sure you want to delete this order? This action cannot be undone.",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {/* Instead of DialogFooter, just use a styled div */}
        <div className="flex gap-3 mt-6 justify-end">
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
