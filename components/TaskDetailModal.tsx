"use client";

import { Task } from "@/types/task";
import { useAppSelector } from "@/hooks/redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Flag,
  LayoutGrid,
  Calendar,
  User,
  Tag,
  Clock,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
}

const priorityConfig = {
  high: {
    label: "High",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  low: {
    label: "Low",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
};

const statusConfig = {
  todo: {
    label: "Not Started",
    color: "text-slate-600",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
    icon: Circle,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: Clock,
  },
  done: {
    label: "Completed",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
};

const columnColorMap: Record<string, { color: string; bg: string; border: string }> = {
  "bg-violet-500": { color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800" },
  "bg-pink-500":   { color: "text-pink-600",   bg: "bg-pink-50 dark:bg-pink-900/20",     border: "border-pink-200 dark:border-pink-800"   },
  "bg-orange-500": { color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  "bg-cyan-500":   { color: "text-cyan-600",   bg: "bg-cyan-50 dark:bg-cyan-900/20",     border: "border-cyan-200 dark:border-cyan-800"   },
  "bg-yellow-500": { color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  "bg-rose-500":   { color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-900/20",     border: "border-rose-200 dark:border-rose-800"   },
};

export function TaskDetailModal({ open, onClose, task, onEdit }: TaskDetailModalProps) {
  const columns = useAppSelector((state) => state.columns.columns);

  if (!task) return null;

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] ?? {
    label: task.priority,
    color: "text-slate-600",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  };

  const knownStatus = statusConfig[task.status as keyof typeof statusConfig];
  const matchingColumn = columns.find((col) => col.id === task.status);
  const colStyle = columnColorMap[matchingColumn?.color ?? ""] ?? {
    color: "text-slate-600",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
  };

  const status = knownStatus ?? {
    label: matchingColumn?.label ?? task.status,
    color: colStyle.color,
    bg: colStyle.bg,
    border: colStyle.border,
    icon: LayoutGrid,
  };

  const StatusIcon = status.icon;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  const isOverdue = due < now && task.status !== "done";
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  function getDueLabel() {
    if (isOverdue) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const handleEdit = () => {
    onClose();
    onEdit(task);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-2xl p-0 gap-0 overflow-hidden">

        <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-b px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${status.bg} ${status.border}`}>
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-bold text-left leading-snug">
                    {task.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground text-left mt-0.5">
                    Created{" "}
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto max-h-[65vh] px-6 py-5 space-y-5">
          {task.description ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg px-3 py-2.5 border">
                {task.description}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">No description provided</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Flag className="h-3 w-3" /> Priority
              </p>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${priority.bg} ${priority.border} ${priority.color}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${priority.dot}`} />
                {priority.label}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <LayoutGrid className="h-3 w-3" /> Status
              </p>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${status.bg} ${status.border} ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                {status.label}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Due Date
              </p>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${isOverdue ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800" : "bg-muted/30 border-border text-foreground"}`}>
                {isOverdue ? (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span>{getDueLabel()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" /> Assigned To
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm font-medium text-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                  {task.assignedTo?.[0] ?? "?"}
                </span>
                <span className="truncate">{task.assignedTo || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md font-medium border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-muted/20 px-6 py-4 flex gap-3">
          <Button onClick={handleEdit} className="flex-1 h-11 font-semibold shadow-sm text-sm gap-2">
            <Pencil className="h-4 w-4" />
            Edit Task
          </Button>
          <Button variant="outline" onClick={onClose} className="h-11 px-8 text-sm">
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}