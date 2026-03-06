import { TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusStyles: Record<TaskStatus, string> = {
  "todo": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "done": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const statusLabels: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function TaskStatusBadge({ status, size = "md", className }: TaskStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {status === "in-progress" && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
      )}
      {statusLabels[status]}
    </span>
  );
}