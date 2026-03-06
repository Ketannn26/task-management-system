import { useMemo } from "react";
import { useAppSelector } from "@/hooks/redux";
import { Task } from "@/types/task";

interface UseTaskFiltersReturn {
  filteredTasks: Task[];
  totalCount: number;
  isFiltered: boolean;
}

export function useTaskFilters(): UseTaskFiltersReturn {
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const filters = useAppSelector((state) => state.tasks.filters);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filters.status !== "all") {
      result = result.filter((task) => task.status === filters.status);
    }

    if (filters.priority !== "all") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    if (filters.search.trim() !== "") {
      const keyword = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(keyword) ||
          task.description.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [tasks, filters]);

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