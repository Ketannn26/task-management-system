// components/TaskFiltersBar.tsx
"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setFilters, clearFilters } from "@/store/taskSlice";
import { TaskStatus, TaskPriority } from "@/types/task";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface TaskFiltersBarProps {
  className?: string;
}

export function TaskFiltersBar({ className }: TaskFiltersBarProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.tasks.filters);

  const isFiltered =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.search.trim() !== "";

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>

      {/* ── Search ── */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
          className="pl-9 h-9 text-sm bg-background"
        />
      </div>

      {/* ── Status Filter ── */}
      <Select
        value={filters.status}
        onValueChange={(value) =>
          dispatch(setFilters({ status: value as TaskStatus | "all" }))
        }
      >
        <SelectTrigger className="w-36 h-9 text-sm bg-background">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="todo">Not Started</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="done">Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* ── Priority Filter ── */}
      <Select
        value={filters.priority}
        onValueChange={(value) =>
          dispatch(setFilters({ priority: value as TaskPriority | "all" }))
        }
      >
        <SelectTrigger className="w-36 h-9 text-sm bg-background">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      {/* ── Clear Filters ── */}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(clearFilters())}
          className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}

    </div>
  );
}