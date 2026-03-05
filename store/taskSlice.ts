// store/taskSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Task, TaskFilters } from "@/types/task";

// ─── STATE SHAPE ─────────────────────────────────────────────

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  selectedTask: Task | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Default filter values (no filters active)
const initialFilters: TaskFilters = {
  status: "all",
  priority: "all",
  search: "",
};

const initialState: TaskState = {
  tasks: [],
  filters: initialFilters,
  selectedTask: null,
  status: "idle",
  error: null,
};

// ─── ASYNC THUNKS ────────────────────────────────────────────
// These functions call the API, then dispatch reducers on success

// Fetch all tasks from GET /api/tasks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data: Task[] = await response.json();
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch tasks";
      return rejectWithValue(message);
    }
  },
);

// Create a new task via POST /api/tasks
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData: Omit<Task, "id" | "createdAt">, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error("Failed to create task");
      const data: Task = await response.json();
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create task";
      return rejectWithValue(message);
    }
  },
);

// Edit an existing task via PUT /api/tasks/[id]
export const editTask = createAsyncThunk(
  "tasks/editTask",
  async (
    { id, updates }: { id: string; updates: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const data: Task = await response.json();
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update task";
      return rejectWithValue(message);
    }
  },
);

// Delete a task via DELETE /api/tasks/[id]
export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      // Return the id so we know which task to remove from state
      return id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete task";
      return rejectWithValue(message);
    }
  },
);

// ─── SLICE ───────────────────────────────────────────────────

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Replace entire tasks array
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },

    // Add a single task to the array
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },

    // Update a task by ID (merge partial data)
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },

    // Remove a task by ID
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },

    // Set the currently selected/focused task
    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },

    // Update one or more filter fields
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset all filters back to default
    clearFilters(state) {
      state.filters = initialFilters;
    },
  },

  // extraReducers handle the async thunk lifecycle
  // Each thunk has 3 stages: pending, fulfilled, rejected
  extraReducers: (builder) => {
    // ── fetchTasks ──────────────────────────────────────
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // ── createTask ──────────────────────────────────────
    builder
      .addCase(createTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // ── editTask ────────────────────────────────────────
    builder
      .addCase(editTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // ── removeTask ──────────────────────────────────────
    builder
      .addCase(removeTask.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export the reducers as actions
export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setSelectedTask,
  setFilters,
  clearFilters,
} = taskSlice.actions;

export default taskSlice.reducer;
