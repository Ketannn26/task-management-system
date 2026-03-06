import { KanbanBoard } from "@/components/KanbanBoard";
import { getAllTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = getAllTasks();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <KanbanBoard initialTasks={tasks} />
    </div>
  );
}