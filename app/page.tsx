import Link from "next/link";
import {
  Columns3,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  GripVertical,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-start justify-center px-6 pt-12">
        <div className="max-w-5xl w-full mx-auto grid lg:grid-cols-2 gap-8 items-center py-8">

          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="flex gap-1 items-center text-5xl font-bold tracking-tight">
                <span>Cetnripe</span>
                <span>Flow</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Kanban Task Management App built with Next.js 15, TypeScript,
                dnd-kit and Redux Toolkit. Create custom columns, drag & drop
                tasks, and track your progress with analytics.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: Columns3, text: "Custom columns with color themes" },
                { icon: GripVertical, text: "Drag & drop tasks between any column" },
                { icon: BarChart3, text: "Live analytics with completion tracking" },
                { icon: CheckCircle2, text: "Priority, due dates, tags & assignees" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            <Link
              href="/tasks"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Open Board
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Board</p>
                  <p className="text-[10px] text-muted-foreground">
                    tasks · in progress · completed
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-6 px-2 rounded-md border bg-primary text-[10px] font-medium text-primary-foreground flex items-center">
                    Add Column
                  </div>
                  <div className="h-6 px-2 rounded-md bg-primary text-[10px] font-medium text-primary-foreground flex items-center">
                    + Add Task
                  </div>
                </div>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2 bg-muted/10">
                {/* Not Started */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] text-muted-foreground font-semibold">Not Started</span>
                  </div>
                  <div className="rounded-lg border border-red-300 dark:border-red-800 bg-card p-2 space-y-1.5">
                    <div className="h-2 w-3/4 rounded-full bg-muted" />
                    <div className="h-1.5 w-full rounded-full bg-muted/60" />
                    <div className="flex gap-1">
                      <div className="h-3.5 px-1.5 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center">
                        <div className="h-1 w-5 rounded-full bg-red-400" />
                      </div>
                      <div className="h-3.5 px-1.5 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center">
                        <div className="h-1 w-8 rounded-full bg-red-300" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-2 space-y-1.5">
                    <div className="h-2 w-2/3 rounded-full bg-muted" />
                    <div className="h-1.5 w-full rounded-full bg-muted/60" />
                    <div className="flex gap-1">
                      <div className="h-3.5 px-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center">
                        <div className="h-1 w-5 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-muted-foreground font-semibold">In Progress</span>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-2 space-y-1.5 ring-1 ring-blue-500/20">
                    <div className="h-2 w-full rounded-full bg-muted" />
                    <div className="h-1.5 w-2/3 rounded-full bg-muted/60" />
                    <div className="flex gap-1">
                      <div className="h-3.5 px-1.5 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center">
                        <div className="h-1 w-5 rounded-full bg-red-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground font-semibold">Completed</span>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-2 space-y-1.5 opacity-70">
                    <div className="h-2 w-3/4 rounded-full bg-muted" />
                    <div className="h-1.5 w-1/2 rounded-full bg-muted/60" />
                    <div className="flex gap-1">
                      <div className="h-3.5 px-1.5 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center">
                        <div className="h-1 w-5 rounded-full bg-red-400" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card p-2 space-y-1.5 opacity-70">
                    <div className="h-2 w-2/3 rounded-full bg-muted" />
                    <div className="h-1.5 w-1/3 rounded-full bg-muted/60" />
                    <div className="flex gap-1">
                      <div className="h-3.5 px-1.5 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center">
                        <div className="h-1 w-5 rounded-full bg-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 border-t bg-muted/20 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-medium">Completion</span>
                <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-1/3 rounded-full bg-primary" />
                </div>
                <span className="text-[10px] text-primary font-bold">33%</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}