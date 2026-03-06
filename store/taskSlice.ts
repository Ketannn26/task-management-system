import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Task, TaskFilters } from "@/types/task";

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  selectedTask: Task | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

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

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return await response.json() as Task[];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch tasks");
    }
  },
);

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
      return await response.json() as Task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create task");
    }
  },
);

export const editTask = createAsyncThunk(
  "tasks/editTask",
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return await response.json() as Task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update task");
    }
  },
);

export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete task");
    }
  },
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },

    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },

    updateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tasks[index] = action.payload;
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },

    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },

    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters(state) {
      state.filters = initialFilters;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.status = "succeeded"; state.tasks = action.payload; })
      .addCase(fetchTasks.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; });

    builder
      .addCase(createTask.pending, (state) => { state.status = "loading"; })
      .addCase(createTask.fulfilled, (state, action) => { state.status = "succeeded"; state.tasks.push(action.payload); })
      .addCase(createTask.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; });

    builder
      .addCase(editTask.pending, (state) => { state.status = "loading"; })
      .addCase(editTask.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.tasks[index] = action.payload;
      })
      .addCase(editTask.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; });

    builder
      .addCase(removeTask.pending, (state) => { state.status = "loading"; })
      .addCase(removeTask.fulfilled, (state, action) => { state.status = "succeeded"; state.tasks = state.tasks.filter((t) => t.id !== action.payload); })
      .addCase(removeTask.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; });
  },
});

export const { setTasks, addTask, updateTask, deleteTask, setSelectedTask, setFilters, clearFilters } =
  taskSlice.actions;

export default taskSlice.reducer;