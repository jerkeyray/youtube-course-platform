"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
  videoTitle: string;
}

export function AddBookmarkDialog({
  isOpen,
  onClose,
  onConfirm,
  videoTitle,
}: AddBookmarkDialogProps) {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(note);
      setNote("");
      onClose();
    } catch {
      toast.error("Failed to add bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Add a bookmark for "{videoTitle}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] dark:bg-blue-950/50 dark:border-blue-700"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isLoading ? "Adding..." : "Add Bookmark"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
