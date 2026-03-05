// types/task.ts

// Priority can only be one of these 3 values
export type TaskPriority = "low" | "medium" | "high";

// string to support custom column IDs
export type TaskStatus = "todo" | "in-progress" | "done" | (string & {});

// The full shape of a Task object
export interface Task {
  id: string; // unique ID like "abc-123"
  title: string; // "Fix login bug"
  description: string; // "The login button doesn't work on mobile"
  priority: TaskPriority; // must be "low", "medium", or "high"
  status: TaskStatus; // must be "todo", "in-progress", or "done"
  dueDate: string; // date as ISO string e.g. "2024-03-15T00:00:00.000Z"
  createdAt: string; // when task was created, also ISO string
  tags: string[]; // array of strings e.g. ["bug", "frontend"]
  assignedTo: string; // person's name e.g. "John"
}

// The shape of active filters in the UI
export interface TaskFilters {
  status: TaskStatus | "all"; // filter by status, or show "all"
  priority: TaskPriority | "all"; // filter by priority, or show "all"
  search: string; // search keyword, empty string means no search
}

// ✅ Add this — defines each kanban column
export interface KanbanColumn {
  id: TaskStatus;
  label: string;
  color: string; // dot color
  bgColor: string; // column background color
  borderColor: string; // column border color
  isDefault?: boolean; // default columns cannot be deleted
}
