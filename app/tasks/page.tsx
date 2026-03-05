// app/tasks/page.tsx
import { KanbanBoard } from "@/components/KanbanBoard";
import { getAllTasks } from "@/lib/tasks";

// ✅ Force fresh data on every request (no caching)
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = getAllTasks();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <KanbanBoard initialTasks={tasks} />
    </div>
  );
}