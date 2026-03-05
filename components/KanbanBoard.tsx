// components/KanbanBoard.tsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setTasks, removeTask, editTask, deleteTask } from "@/store/taskSlice";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { Task, TaskStatus } from "@/types/task";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCard } from "@/components/KanbanCard";
import { TaskFiltersBar } from "@/components/TaskFiltersBar";
import { StatsSidebar } from "@/components/StatsSidebar";
import { AddTaskModal } from "@/components/AddTaskModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { AddColumnModal } from "@/components/AddColumnModal";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { Button } from "@/components/ui/button";
import { Plus, Columns3 } from "lucide-react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface KanbanBoardProps {
  initialTasks: Task[];
}

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const { filteredTasks } = useTaskFilters();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const mounted = useIsMounted();

  // ── Read columns from Redux instead of hardcoded array ──
  const columns = useAppSelector((state) => state.columns.columns);

  // ── Modal states ─────────────────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDefaultStatus, setAddModalDefaultStatus] =
    useState<TaskStatus>("todo");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false); // ← new

  useEffect(() => {
    dispatch(setTasks(initialTasks));
  }, [dispatch, initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const getColumnTasks = (columnId: string): Task[] =>
    filteredTasks.filter((task) => task.status === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    const task = filteredTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const draggedTask = filteredTasks.find((t) => t.id === taskId);
    if (!draggedTask) return;

    // ✅ Changed TaskStatus to string — supports custom column IDs
    let newStatus: string;
    if (columns.some((col) => col.id === overId)) {
      newStatus = overId;
    } else {
      const overTask = filteredTasks.find((t) => t.id === overId);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    if (draggedTask.status !== newStatus) {
      dispatch(
        editTask({ id: taskId, updates: { status: newStatus as TaskStatus } }),
      );
    }
  };

  const handleViewTask = (task: Task) => {
    setTaskToView(task);
    setDetailModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    dispatch(deleteTask(id)); // ← instant UI update
    await dispatch(removeTask(id)); // ← API call
  };
  const handleAddTask = (status: TaskStatus) => {
    setAddModalDefaultStatus(status);
    setAddModalOpen(true);
  };

  const totalTasks = filteredTasks.length;
  const inProgressCount = getColumnTasks("in-progress").length;
  const doneCount = getColumnTasks("done").length;

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* ── Left: board area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Board</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mounted ? (
                <>
                  {totalTasks} tasks · {inProgressCount} in progress ·{" "}
                  {doneCount} completed
                </>
              ) : (
                <span className="invisible">
                  0 tasks · 0 in progress · 0 completed
                </span>
              )}
            </p>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-2">
            {/* Add Column button */}
            <Button
              variant="outline"
              onClick={() => setAddColumnModalOpen(true)}
              className="gap-2 shadow-sm"
              size="sm"
            >
              <Columns3 className="h-4 w-4" />
              Add Column
            </Button>

            {/* Add Task button */}
            <Button
              onClick={() => handleAddTask("todo")}
              className="gap-2 shadow-sm"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* ── Filters Bar ── */}
        <div className="px-6 py-3 border-b bg-muted/30 shrink-0">
          <TaskFiltersBar />
        </div>

        {/* ── Kanban columns ── */}
        <div className="flex-1 overflow-x-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5 h-full min-w-max items-start">
              {/* ── Read from Redux columns ── */}
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={getColumnTasks(column.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddTask={handleAddTask}
                  onViewTask={handleViewTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <KanbanCard
                  task={activeTask}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleViewTask}
                  className="rotate-1 shadow-2xl opacity-95"
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* ── Right: stats sidebar ── */}
      <StatsSidebar />

      {/* ── Modals ── */}
      <AddTaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultStatus={addModalDefaultStatus}
      />
      <EditTaskModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setTaskToEdit(null);
        }}
        task={taskToEdit}
      />
      <TaskDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setTaskToView(null);
        }}
        task={taskToView}
        onEdit={(task) => {
          setDetailModalOpen(false);
          handleEdit(task);
        }}
      />

      {/* ── Add Column Modal ── */}
      <AddColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
      />
    </div>
  );
}
