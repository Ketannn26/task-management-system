// components/KanbanCard.tsx
"use client";

import { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Pencil,
  Trash2,
  AlertTriangle,
  GripVertical,
  Clock,
} from "lucide-react";

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onView: (task: Task) => void;
  className?: string;
}

const priorityConfig: Record<Task["priority"], { label: string; className: string; dot: string }> = {
  low: {
    label: "Low",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  high: {
    label: "High",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    dot: "bg-red-500",
  },
};

export function KanbanCard({
  task,
  onEdit,
  onDelete,
  onView,
  className,
}: KanbanCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Track mouse position to distinguish click vs drag ──
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragRef = useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status !== "done";

  const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const priority = priorityConfig[task.priority];

  // ── Only open modal if mouse didn't move (real click, not drag) ──
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    isDragRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDownPos.current) return;
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    // If mouse moved more than 5px, treat as drag not click
    if (dx > 5 || dy > 5) {
      isDragRef.current = true;
    }
  };

  const handleClick = () => {
    // Only open modal if it was a genuine click (no drag movement)
    if (!isDragRef.current) {
      onView(task);
    }
    isDragRef.current = false;
    mouseDownPos.current = null;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={cn(
          "group relative bg-card rounded-xl border shadow-sm",
          "transition-all duration-200",
          "hover:shadow-md hover:-translate-y-0.5",
          "cursor-pointer",
          isOverdue
            ? "border-red-300 dark:border-red-800"
            : "border-border/60",
          isDragging && "opacity-40 shadow-lg",
          className
        )}
      >
        {/* ── Left accent border based on priority ── */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
            priority.dot
          )}
        />

        <div className="p-3.5 pl-4">

          {/* ── Top row — title + drag handle ── */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
              {isOverdue && (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              )}
              <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                {task.title}
              </h3>
            </div>

            {/* ── Drag handle ── */}
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>

          {/* ── Description ── */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* ── Priority + Overdue badges ── */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border",
                priority.className
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>

            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                <Clock className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>

          {/* ── Tags ── */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-medium">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold uppercase">
                {task.assignedTo ? task.assignedTo[0] : "?"}
              </div>
              <span className="font-medium">
                {task.assignedTo || "Unassigned"}
              </span>
            </div>

            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {formattedDate}
            </div>
          </div>
        </div>

        {/* ── Hover action buttons ── */}
        <div className="absolute top-2 right-8 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-lg bg-background/90 shadow-sm border border-border/50 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-lg bg-background/90 shadow-sm border border-border/50 hover:bg-background hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          onDelete(task.id);
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
