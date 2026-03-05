// store/columnSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KanbanColumn } from "@/types/task";

// ── Predefined color themes for new columns ───────────────
export const COLUMN_COLOR_OPTIONS = [
  {
    color: "bg-violet-500",
    bgColor: "bg-violet-50/80 dark:bg-violet-900/20",
    borderColor: "border-violet-200 dark:border-violet-800/60",
    preview: "#8b5cf6",
  },
  {
    color: "bg-pink-500",
    bgColor: "bg-pink-50/80 dark:bg-pink-900/20",
    borderColor: "border-pink-200 dark:border-pink-800/60",
    preview: "#ec4899",
  },
  {
    color: "bg-orange-500",
    bgColor: "bg-orange-50/80 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800/60",
    preview: "#f97316",
  },
  {
    color: "bg-cyan-500",
    bgColor: "bg-cyan-50/80 dark:bg-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800/60",
    preview: "#06b6d4",
  },
  {
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50/80 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800/60",
    preview: "#eab308",
  },
  {
    color: "bg-rose-500",
    bgColor: "bg-rose-50/80 dark:bg-rose-900/20",
    borderColor: "border-rose-200 dark:border-rose-800/60",
    preview: "#f43f5e",
  },
];

const DEFAULT_COLUMNS: KanbanColumn[] = [
  {
    id: "todo",
    label: "Not Started",
    color: "bg-slate-400",
    bgColor: "bg-slate-50/80 dark:bg-slate-900/40",
    borderColor: "border-slate-200 dark:border-slate-700/60",
    isDefault: true,
  },
  {
    id: "in-progress",
    label: "In Progress",
    color: "bg-blue-500",
    bgColor: "bg-blue-50/80 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800/60",
    isDefault: true,
  },
  {
    id: "done",
    label: "Completed",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50/80 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800/60",
    isDefault: true,
  },
];

interface ColumnState {
  columns: KanbanColumn[];
}

const initialState: ColumnState = {
  columns: DEFAULT_COLUMNS,
};

const columnSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {
    // ── Add new column ──────────────────────────────────
    addColumn(state, action: PayloadAction<Omit<KanbanColumn, "id">>) {
      const id = `custom-${Date.now()}`;
      state.columns.push({ id, ...action.payload });
    },

    // ── Rename existing column ──────────────────────────
    renameColumn(state, action: PayloadAction<{ id: string; label: string }>) {
      const col = state.columns.find((c) => c.id === action.payload.id);
      if (col) col.label = action.payload.label;
    },
    reorderColumns: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>,
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const updated = [...state.columns];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      state.columns = updated;
    },
    // ── Delete column (only non-default) ────────────────
    deleteColumn(state, action: PayloadAction<string>) {
      const col = state.columns.find((c) => c.id === action.payload);
      if (col && !col.isDefault) {
        state.columns = state.columns.filter((c) => c.id !== action.payload);
      }
    },
  },
});

export const { addColumn, renameColumn, deleteColumn, reorderColumns } =
  columnSlice.actions;
export default columnSlice.reducer;
