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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseTitle: string;
}

export function DeleteCourseDialog({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
}: DeleteCourseDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (confirmText === courseTitle) {
      onConfirm();
      onClose();
      setConfirmText("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            course and all its associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label
            htmlFor="confirm-text"
            className="mb-2 block dark:text-blue-200"
          >
            Please type{" "}
            <span className="font-semibold dark:text-blue-100">
              {courseTitle}
            </span>{" "}
            to confirm deletion
          </Label>
          <Input
            id="confirm-text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type course name to confirm"
            className="mt-2 dark:bg-blue-950/50 dark:border-blue-700"
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
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== courseTitle}
            className="dark:bg-red-800 dark:hover:bg-red-700"
          >
            Delete Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
