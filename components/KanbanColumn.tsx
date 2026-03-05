// components/KanbanColumn.tsx
"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, KanbanColumn as KanbanColumnType } from "@/types/task";
import { KanbanCard } from "@/components/KanbanCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/redux";
import { renameColumn, deleteColumn } from "@/store/columnSlice";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTask: (status: Task["status"]) => void;
  onViewTask: (task: Task) => void;
  className?: string;
}

export function KanbanColumn({
  column,
  tasks,
  onEdit,
  onDelete,
  onAddTask,
  onViewTask,
  className,
}: KanbanColumnProps) {
  const dispatch = useAppDispatch();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const mounted = useIsMounted();

  // ── Rename state ──────────────────────────────────────────
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.label);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Delete confirm state ──────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  const handleRenameStart = () => {
    setRenameValue(column.label);
    setIsRenaming(true);
  };

  const handleRenameConfirm = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== column.label) {
      dispatch(renameColumn({ id: column.id, label: trimmed }));
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setRenameValue(column.label);
    setIsRenaming(false);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteColumn(column.id));
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col rounded-2xl border w-80 shrink-0",
          "transition-all duration-200",
          column.bgColor,
          column.borderColor,
          isOver && "ring-2 ring-primary/50 ring-offset-2 scale-[1.01]",
          className,
        )}
      >
        {/* ── Column Header ── */}
        <div className="flex items-center justify-between px-4 py-3 group/header">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Colored dot */}
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full shadow-sm shrink-0",
                column.color,
              )}
            />

            {/* ── Inline rename input OR label ── */}
            {isRenaming ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameConfirm();
                    if (e.key === "Escape") handleRenameCancel();
                  }}
                  className="h-7 text-sm font-semibold px-2 py-0 border-primary"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={handleRenameConfirm}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleRenameCancel}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <h2
                  className="font-semibold text-sm text-foreground tracking-tight truncate cursor-pointer hover:text-primary transition-colors"
                  onDoubleClick={handleRenameStart}
                  title="Double-click to rename"
                >
                  {column.label}
                </h2>

                {/* Task count */}
                <span className="text-xs font-medium text-muted-foreground bg-background/70 border px-2 py-0.5 rounded-full shrink-0">
                  {mounted ? tasks.length : 0}
                </span>
              </>
            )}
          </div>

          {/* ── Header action buttons ── */}
          {!isRenaming && (
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Rename button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-lg opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-background/70"
                onClick={handleRenameStart}
                title="Rename column"
              >
                <Pencil className="h-3 w-3" />
              </Button>

              {/* Delete button — only for non-default columns */}
              {!column.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-lg opacity-0 group-hover/header:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete column"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}

              {/* Add task button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-background/70"
                onClick={() => onAddTask(column.id)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* ── Colored top accent line ── */}
        <div
          className={cn("h-0.5 mx-4 rounded-full opacity-60", column.color)}
        />

        {/* ── Task list ── */}
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2.5 p-3 flex-1 min-h-32"
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {mounted &&
              tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onViewTask}
                />
              ))}
          </SortableContext>

          {/* Empty state */}
          {mounted && tasks.length === 0 && (
            <div
              className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border/40 rounded-xl cursor-pointer hover:border-border/70 transition-colors"
              onClick={() => onAddTask(column.id)}
            >
              <Plus className="h-5 w-5 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground/70 font-medium">
                Add a task
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirm dialog ── */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Column"
        description={`Are you sure you want to delete "${column.label}"? Tasks in this column will remain but become unfiltered.`}
        confirmLabel="Delete Column"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
