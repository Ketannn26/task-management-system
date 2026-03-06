"use client";

import { useState } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { addColumn, COLUMN_COLOR_OPTIONS } from "@/store/columnSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddColumnModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddColumnModal({ open, onClose }: AddColumnModalProps) {
  const dispatch = useAppDispatch();
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [error, setError] = useState("");

  const handleClose = () => {
    setLabel("");
    setSelectedColor(0);
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!label.trim()) {
      setError("Column name is required");
      return;
    }
    const chosen = COLUMN_COLOR_OPTIONS[selectedColor];
    dispatch(
      addColumn({
        label: label.trim(),
        color: chosen.color,
        bgColor: chosen.bgColor,
        borderColor: chosen.borderColor,
        isDefault: false,
      })
    );
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-full max-w-md p-0 gap-0 overflow-hidden">

        <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-left">
                  New Column
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground text-left mt-0.5">
                  Add a new column to your board
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Column Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. In Review, Blocked, Testing..."
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setError("");
              }}
              className={cn(
                "h-11 text-sm",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {error && <p className="text-xs text-destructive">⚠ {error}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Column Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLUMN_COLOR_OPTIONS.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-150 border-2",
                    selectedColor === index
                      ? "border-foreground scale-110 shadow-md"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ background: option.preview }}
                />
              ))}
            </div>
            <div
              className={cn(
                "mt-3 rounded-xl border px-4 py-2.5 flex items-center gap-2",
                COLUMN_COLOR_OPTIONS[selectedColor].bgColor,
                COLUMN_COLOR_OPTIONS[selectedColor].borderColor
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  COLUMN_COLOR_OPTIONS[selectedColor].color
                )}
              />
              <span className="text-sm font-semibold text-foreground">
                {label || "Column Preview"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/20 px-6 py-4 flex gap-3">
          <Button
            onClick={handleSubmit}
            className="flex-1 h-11 font-semibold text-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Column
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-11 px-8 text-sm"
          >
            Cancel
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}