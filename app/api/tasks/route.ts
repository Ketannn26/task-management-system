// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask } from "@/lib/tasks";
import { Task } from "@/types/task";

// ─── GET /api/tasks ───────────────────────────────────────
export async function GET(request: NextRequest) {
  // Get all tasks from our in-memory store
  let tasks = getAllTasks();

  // Read query parameters from the URL
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  // Filter by status if provided
  if (status) {
    tasks = tasks.filter((task) => task.status === status);
  }

  // Filter by priority if provided
  if (priority) {
    tasks = tasks.filter((task) => task.priority === priority);
  }

  // Filter by search keyword if provided (case-insensitive)
  if (search) {
    const keyword = search.toLowerCase();
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword),
    );
  }

  // Return the filtered tasks as JSON
  return NextResponse.json(tasks, { status: 200 });
}

// ─── POST /api/tasks ──────────────────────────────────────
export async function POST(request: NextRequest) {
  // Read the request body (what the user sent us)
  const body = await request.json();

  // ── Validation ──────────────────────────────────────────

  // Make sure title is not empty
  if (!body.title || body.title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Make sure dueDate is provided and is a valid date
  if (!body.dueDate || isNaN(new Date(body.dueDate).getTime())) {
    return NextResponse.json(
      { error: "A valid due date is required" },
      { status: 400 },
    );
  }

  // ── Build the new task ───────────────────────────────────

  // We generate id and createdAt on the server (not from the user)
  const newTask: Task = {
    id: crypto.randomUUID(), // generates a unique ID like "a1b2-c3d4-..."
    title: body.title.trim(),
    description: body.description ?? "",
    priority: body.priority ?? "medium",
    status: body.status ?? "todo",
    dueDate: new Date(body.dueDate).toISOString(),
    createdAt: new Date().toISOString(),
    tags: body.tags ?? [],
    assignedTo: body.assignedTo ?? "",
  };

  // Save it to our in-memory store
  const created = createTask(newTask);

  // Return the newly created task with status 201 (Created)
  return NextResponse.json(created, { status: 201 });
}
