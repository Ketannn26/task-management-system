// components/StatsSidebar.tsx
"use client";

import { useSyncExternalStore } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAppSelector } from "@/hooks/redux";
import { CalendarDays, AlertTriangle } from "lucide-react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const TAILWIND_TO_HEX: Record<string, string> = {
  "bg-violet-500": "#8b5cf6",
  "bg-pink-500":   "#ec4899",
  "bg-orange-500": "#f97316",
  "bg-cyan-500":   "#06b6d4",
  "bg-yellow-500": "#eab308",
  "bg-rose-500":   "#f43f5e",
};

const KNOWN_COLORS: Record<string, string> = {
  todo: "#94a3b8",
  "in-progress": "#3b82f6",
  done: "#10b981",
};

export function StatsSidebar() {
  const mounted = useIsMounted();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const columns = useAppSelector((state) => state.columns.columns);

  const total = tasks.length;

  // ── Dynamically compute count per column ─────────────
 const columnCounts = columns.map((col) => {
  const count = tasks.filter((t) => t.status === col.id).length;
  const color =
    KNOWN_COLORS[col.id] ??           // default 3 columns by id
    TAILWIND_TO_HEX[col.color] ;// ✅ custom column by its chosen color
  return { id: col.id, label: col.label, count, color };
});

  // ── Completed % based on "done" column only ───────────
  const done = tasks.filter((t) => t.status === "done").length;
  const completedPercent = total === 0 ? 0 : Math.round((done / total) * 100);

  // ── Chart data — one slice per column ────────────────
  const chartData =
    total === 0
      ? [{ name: "No tasks", value: 1, color: "#e2e8f0" }]
      : columnCounts
          .filter((c) => c.count > 0)
          .map((c) => ({
            name: c.label,
            value: c.count,
            color: c.color,
          }));

  // ── Upcoming tasks — sorted by due date ──────────────
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "done")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 5);

  function formatDueLabel(dueDateStr: string): {
    label: string;
    isOverdue: boolean;
    isDueToday: boolean;
  } {
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0)
      return {
        label: `${Math.abs(diffDays)}d overdue`,
        isOverdue: true,
        isDueToday: false,
      };
    if (diffDays === 0)
      return { label: "Due today", isOverdue: false, isDueToday: true };
    if (diffDays === 1)
      return { label: "Due tomorrow", isOverdue: false, isDueToday: false };
    if (diffDays <= 7)
      return {
        label: `In ${diffDays} days`,
        isOverdue: false,
        isDueToday: false,
      };
    return {
      label: due.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isOverdue: false,
      isDueToday: false,
    };
  }

  const priorityColor: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };

  return (
    <aside className="w-56 shrink-0 border-l bg-muted/20 dark:bg-muted/10 flex flex-col h-full overflow-y-auto">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b bg-muted/20 dark:bg-muted/10 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Analytics
        </p>
      </div>

      <div className="flex flex-col gap-3 p-3">
        {/* ── Completion card ── */}
        <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-3 py-2.5 border-b border-dashed">
            <p className="text-xs font-semibold text-foreground leading-none">
              Completion
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {mounted ? `${done} of ${total} tasks done` : "Loading..."}
            </p>
          </div>

          <div className="px-3 py-3 flex flex-col items-center gap-3">
            {/* ── Compact donut ── */}
            <div className="relative w-24 h-24">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={42}
                      paddingAngle={total === 0 ? 0 : 4}
                      dataKey="value"
                      strokeWidth={0}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={total === 0 ? "#e2e8f0" : entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(
                        value: number | undefined,
                        name: string | undefined,
                      ) => [
                        `${value ?? 0} task${(value ?? 0) !== 1 ? "s" : ""}`,
                        name ?? "",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        fontSize: "11px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-8 border-muted animate-pulse" />
              )}

              {/* Center % */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-emerald-500 leading-none">
                  {mounted ? `${completedPercent}%` : "–"}
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                  done
                </span>
              </div>
            </div>

            {/* ── Legend — dynamic per column ── */}
            <div className="w-full flex flex-col gap-2">
              {columnCounts.map((col) => {
                const pct =
                  total === 0 ? 0 : Math.round((col.count / total) * 100);
                return (
                  <div key={col.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: col.color }}
                        />
                        <span className="text-[10px] text-muted-foreground truncate max-w-20">
                          {col.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold tabular-nums">
                        {mounted ? col.count : "–"}
                      </span>
                    </div>
                    {/* Hairline progress bar */}
                    <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: mounted ? `${pct}%` : "0%",
                          background: col.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Due Soon card ── */}
        <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-3 py-2.5 border-b border-dashed flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground leading-none">
              Due Soon
            </p>
          </div>

          {/* List */}
          {!mounted ? (
            // Loading skeleton
            <div className="flex flex-col divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-3 py-2.5 flex flex-col gap-1">
                  <div className="h-2 w-3/4 rounded-full bg-muted animate-pulse" />
                  <div className="h-1.5 w-1/3 rounded-full bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : upcomingTasks.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-6 px-3 gap-1.5">
              <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                All caught up!
                <br />
                No pending tasks.
              </p>
            </div>
          ) : (
            // ── Read-only task list ──
            <div className="flex flex-col">
              {upcomingTasks.map((task, index) => {
                const { label, isOverdue, isDueToday } = formatDueLabel(
                  task.dueDate,
                );
                return (
                  // ✅ Plain div — no click, no navigation, read-only
                  <div
                    key={task.id}
                    className={`px-3 py-2.5 flex flex-col gap-0.5 ${
                      index !== upcomingTasks.length - 1 ? "border-b" : ""
                    }`}
                  >
                    {/* Title */}
                    <div className="flex items-center gap-1.5">
                      {isOverdue ? (
                        <AlertTriangle className="h-2.5 w-2.5 text-red-500 shrink-0" />
                      ) : (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: priorityColor[task.priority] }}
                        />
                      )}
                      <span className="text-[11px] font-medium text-foreground line-clamp-1">
                        {task.title}
                      </span>
                    </div>

                    {/* Due label + priority pill */}
                    <div className="flex items-center justify-between pl-3">
                      <span
                        className={`text-[10px] font-medium ${
                          isOverdue
                            ? "text-red-500"
                            : isDueToday
                              ? "text-amber-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold capitalize"
                        style={{
                          background: `${priorityColor[task.priority]}18`,
                          color: priorityColor[task.priority],
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom padding ── */}
        <div className="h-2" />
      </div>
    </aside>
  );
}
