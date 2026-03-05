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
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setTasks, removeTask, editTask, deleteTask } from "@/store/taskSlice";
import { reorderColumns } from "@/store/columnSlice"; // ← new
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
import { store } from "@/store/index"; // ← for reading all tasks during drag

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
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null); // ← new
  const mounted = useIsMounted();

  const columns = useAppSelector((state) => state.columns.columns);

  // ── Modal states ──────────────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDefaultStatus, setAddModalDefaultStatus] =
    useState<TaskStatus>("todo");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);

  useEffect(() => {
    dispatch(setTasks(initialTasks));
  }, [dispatch, initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const getColumnTasks = (columnId: string): Task[] =>
    filteredTasks.filter((task) => task.status === columnId);

  // ── Drag Start — detect column vs card ───────────────
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // ✅ Column drag
    if (active.data.current?.type === "column") {
      setActiveColumnId(active.id as string);
      return;
    }

    // ✅ Card drag
    const task = store.getState().tasks.tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  // ── Drag End — handle column reorder OR card move ────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);
    if (!over) return;

    // ✅ Column reorder
    if (active.data.current?.type === "column") {
      const fromIndex = columns.findIndex((c) => c.id === active.id);
      const toIndex = columns.findIndex((c) => c.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        dispatch(reorderColumns({ fromIndex, toIndex }));
      }
      return;
    }

    // ✅ Card move (existing logic — uses store for all tasks)
    const taskId = active.id as string;
    const overId = over.id as string;
    const allTasks = store.getState().tasks.tasks;
    const draggedTask = allTasks.find((t) => t.id === taskId);
    if (!draggedTask) return;

    let newStatus: string;
    if (columns.some((col) => col.id === overId)) {
      newStatus = overId;
    } else {
      const overTask = allTasks.find((t) => t.id === overId);
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
    dispatch(deleteTask(id));
    await dispatch(removeTask(id));
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

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAddColumnModalOpen(true)}
              className="gap-2 shadow-sm"
              size="sm"
            >
              <Columns3 className="h-4 w-4" />
              Add Column
            </Button>
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
            {/* ✅ SortableContext enables column drag-to-reorder */}
            <SortableContext
              items={columns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-5 h-full min-w-max items-start">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={getColumnTasks(column.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewTask={handleViewTask}
                  />
                ))}
              </div>
            </SortableContext>

            {/* ✅ DragOverlay — shows ghost for both columns and cards */}
            <DragOverlay>
              {activeColumnId ? (
                <div className="opacity-80 rotate-1 shadow-2xl">
                  <KanbanColumn
                    column={columns.find((c) => c.id === activeColumnId)!}
                    tasks={getColumnTasks(activeColumnId)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewTask={handleViewTask}
                  />
                </div>
              ) : activeTask ? (
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
      <AddColumnModal
        open={addColumnModalOpen}
        onClose={() => setAddColumnModalOpen(false)}
      />
    </div>
  );
}