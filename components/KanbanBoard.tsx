"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
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
import { reorderColumns, resetColumns } from "@/store/columnSlice";
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
import { store } from "@/store/index";

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
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const mounted = useIsMounted();
  const columns = useAppSelector((state) => state.columns.columns);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showSlider, setShowSlider] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDefaultStatus, setAddModalDefaultStatus] = useState<TaskStatus>("todo");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    dispatch(setTasks(initialTasks));
    dispatch(resetColumns());
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) {
        setShowSlider(false);
        return;
      }
      setShowSlider(true);
      setScrollPercent((el.scrollLeft / maxScroll) * 100);
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [columns]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (Number(e.target.value) / 100) * maxScroll;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const getColumnTasks = (columnId: string): Task[] =>
    filteredTasks.filter((task) => task.status === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "column") {
      setActiveColumnId(active.id as string);
      return;
    }
    const task = store.getState().tasks.tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);
    if (!over) return;

    if (active.data.current?.type === "column") {
      const fromIndex = columns.findIndex((c) => c.id === active.id);
      const toIndex = columns.findIndex((c) => c.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        dispatch(reorderColumns({ fromIndex, toIndex }));
      }
      return;
    }

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
      dispatch(editTask({ id: taskId, updates: { status: newStatus as TaskStatus } }));
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
      <div className="flex flex-col flex-1 min-w-0">

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
            <Button onClick={() => setAddColumnModalOpen(true)} className="gap-2 shadow-sm" size="sm">
              <Columns3 className="h-4 w-4" />
              Add Column
            </Button>
            <Button onClick={() => handleAddTask("todo")} className="gap-2 shadow-sm" size="sm">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="px-6 py-3 border-b bg-muted/30 shrink-0">
          <TaskFiltersBar />
        </div>

        {showSlider && (
          <div className="px-6 pt-2 pb-1 bg-background shrink-0">
            <div className="relative flex items-center h-4">
              <div className="w-full h-0.5 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-none"
                  style={{ width: `${scrollPercent}%` }}
                />
              </div>
              <div
                className="absolute h-3 w-3 rounded-full bg-primary shadow-sm border-2 border-background pointer-events-none"
                style={{ left: `calc(${scrollPercent}% - 6px)` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={scrollPercent}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
              />
            </div>
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-auto ${showSlider ? "pt-2 px-6 pb-6" : "p-6"}`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
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

      <StatsSidebar />

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