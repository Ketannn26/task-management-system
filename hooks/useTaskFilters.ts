// hooks/useTaskFilters.ts
import { useMemo } from "react";
import { useAppSelector } from "@/hooks/redux";
import { Task } from "@/types/task";

interface UseTaskFiltersReturn {
  filteredTasks: Task[];
  totalCount: number;
  isFiltered: boolean;
}

export function useTaskFilters(): UseTaskFiltersReturn {
  // Read tasks and filters from Redux store
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const filters = useAppSelector((state) => state.tasks.filters);

  // useMemo means this only recalculates when tasks or filters change
  // not on every single render — good for performance
  const filteredTasks = useMemo(() => {
    let result = [...tasks]; // copy the array so we don't mutate Redux state

    // ── Filter by status ──────────────────────────────────
    if (filters.status !== "all") {
      result = result.filter((task) => task.status === filters.status);
    }

    // ── Filter by priority ────────────────────────────────
    if (filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    // ── Filter by search keyword ──────────────────────────
    if (filters.search.trim() !== "") {
      const keyword = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(keyword) ||
          task.description.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [tasks, filters]); // only recalculate when these change

  // isFiltered is true when any filter is active
  const isFiltered =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.search.trim() !== "";

  return {
    filteredTasks,
    totalCount: filteredTasks.length,
    isFiltered,
  };
}
