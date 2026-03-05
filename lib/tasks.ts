// lib/tasks.ts
import { Task } from "@/types/task";

// ✅ CHANGE 1: rename to defaultTasks and make it const
const defaultTasks: Task[] = [
  {
    id: "1",
    title: "Set up project structure",
    description: "Initialize Next.js project with TypeScript, Tailwind, and shadcn/ui",
    priority: "high",
    status: "todo",
    dueDate: new Date("2026-03-01").toISOString(),
    createdAt: new Date("2026-02-28").toISOString(),
    tags: ["setup", "frontend"],
    assignedTo: "Alice",
  },
  {
    id: "2",
    title: "Build TaskCard component",
    description: "Create a reusable TaskCard that shows title, priority, status and due date",
    priority: "high",
    status: "done",
    dueDate: new Date("2026-02-10").toISOString(),
    createdAt: new Date("2026-03-01").toISOString(),
    tags: ["component", "ui"],
    assignedTo: "Bob",
  },
  {
    id: "3",
    title: "Set up Redux store",
    description: "Configure Redux Toolkit with taskSlice, reducers and async thunks",
    priority: "high",
    status: "in-progress",
    dueDate: new Date("2026-03-15").toISOString(),
    createdAt: new Date("2026-03-01").toISOString(),
    tags: ["redux", "state"],
    assignedTo: "Alice",
  },
  {
    id: "4",
    title: "Write API route handlers",
    description: "Build GET, POST, PUT, DELETE endpoints for tasks under app/api/tasks",
    priority: "medium",
    status: "done",
    dueDate: new Date("2026-03-20").toISOString(),
    createdAt: new Date("2026-03-02").toISOString(),
    tags: ["api", "backend"],
    assignedTo: "Charlie",
  },
  {
    id: "5",
    title: "Add dark mode support",
    description: "Implement ThemeContext with localStorage persistence for dark/light mode",
    priority: "low",
    status: "todo",
    dueDate: new Date("2026-03-25").toISOString(),
    createdAt: new Date("2026-03-02").toISOString(),
    tags: ["ui", "theme"],
    assignedTo: "Bob",
  },
  {
    id: "6",
    title: "Write unit tests",
    description: "Add Jest tests for all utility functions and custom hooks",
    priority: "medium",
    status: "todo",
    dueDate: new Date("2026-03-28").toISOString(),
    createdAt: new Date("2026-03-03").toISOString(),
    tags: ["testing"],
    assignedTo: "Charlie",
  },
];

// ✅ CHANGE 2: let instead of const so it can be reassigned
let tasks: Task[] = [...defaultTasks];

// ─── READ ───────────────────────────────────────────────

export function getAllTasks(): Task[] {
  // ✅ CHANGE 3: reset to defaults if empty
  if (tasks.length === 0) {
    tasks = [...defaultTasks];
  }
  return tasks;
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

// ─── CREATE ─────────────────────────────────────────────

export function createTask(newTask: Task): Task {
  tasks.push(newTask);
  return newTask;
}

// ─── UPDATE ─────────────────────────────────────────────

export function updateTask(id: string, updatedFields: Partial<Task>): Task | null {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updatedFields };
  return tasks[index];
}

// ─── DELETE ─────────────────────────────────────────────

export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
