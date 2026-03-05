// components/EditTaskModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux"; // ← add useAppSelector
import { editTask } from "@/store/taskSlice";
import { useTaskForm } from "@/hooks/useTaskForm";
import { Task, TaskPriority } from "@/types/task"; // ← remove TaskStatus
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Type,
  AlignLeft,
  Flag,
  LayoutGrid,
  Calendar,
  User,
  Tag,
  Loader2,
  Pencil,
} from "lucide-react";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function EditTaskModal({ open, onClose, task }: EditTaskModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columns = useAppSelector((state) => state.columns.columns); // ← add this

  const { values, errors, handleChange, handleSubmit, reset } = useTaskForm();

  useEffect(() => {
    if (task) {
      handleChange("title", task.title);
      handleChange("description", task.description);
      handleChange("priority", task.priority);
      handleChange("status", task.status);
      handleChange(
        "dueDate",
        new Date(task.dueDate).toISOString().split("T")[0]
      );
      handleChange("assignedTo", task.assignedTo);
      handleChange("tags", task.tags);
    }
  }, [task, handleChange]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = () => {
    if (!task) return;
    handleSubmit(async (formValues) => {
      setIsSubmitting(true);
      try {
        await dispatch(editTask({ id: task.id, updates: formValues }));
        handleClose();
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-full max-w-2xl p-0 gap-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-left">
                  Edit Task
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground text-left mt-0.5">
                  Update the details of this task
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Scrollable form body ── */}
        <div className="overflow-y-auto max-h-[70vh] px-6 py-6 space-y-6">

          {/* ── Title ── */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-title"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <Type className="h-3.5 w-3.5 text-muted-foreground" />
              Title
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              placeholder="What needs to be done?"
              value={values.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={cn(
                "h-11 text-sm",
                errors.title &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">⚠ {errors.title}</p>
            )}
          </div>

          {/* ── Description ── */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-description"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
              Description
            </Label>
            <textarea
              id="edit-description"
              rows={3}
              placeholder="Add more details about this task..."
              value={values.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors"
            />
          </div>

          {/* ── Priority and Status — side by side ── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Priority — unchanged */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                Priority
              </Label>
              <Select
                value={values.priority}
                onValueChange={(v) =>
                  handleChange("priority", v as TaskPriority)
                }
              >
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Status — now dynamic from Redux columns */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                Status
              </Label>
              <Select
                value={values.status}
                onValueChange={(v) => handleChange("status", v)} // ← removed TaskStatus cast
              >
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* ✅ Dynamic — all columns including custom ones */}
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${col.color}`}
                        />
                        {col.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Due Date and Assigned To — side by side ── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Due Date */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-dueDate"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Due Date
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={values.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className={cn(
                  "h-11 text-sm",
                  errors.dueDate &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.dueDate && (
                <p className="text-xs text-destructive">⚠ {errors.dueDate}</p>
              )}
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label
                htmlFor="edit-assignedTo"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Assigned To
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-assignedTo"
                placeholder="Enter person's name"
                value={values.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                className={cn(
                  "h-11 text-sm",
                  errors.assignedTo &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.assignedTo && (
                <p className="text-xs text-destructive">
                  ⚠ {errors.assignedTo}
                </p>
              )}
            </div>
          </div>

          {/* ── Tags ── */}
          <div className="space-y-2">
            <Label
              htmlFor="edit-tags"
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Tags
              <span className="text-xs font-normal text-muted-foreground">
                (comma separated)
              </span>
            </Label>
            <Input
              id="edit-tags"
              placeholder="e.g. bug, frontend, urgent"
              value={values.tags.join(", ")}
              onChange={(e) =>
                handleChange(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
              className="h-11 text-sm"
            />
            {values.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {values.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t bg-muted/20 px-6 py-4 flex gap-3">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 h-11 font-semibold shadow-sm text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-11 px-8 text-sm"
          >
            Cancel
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}