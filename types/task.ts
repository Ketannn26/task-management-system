export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "todo" | "in-progress" | "done" | (string & {});

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  tags: string[];
  assignedTo: string;
}

export interface TaskFilters {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  search: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isDefault?: boolean;
}