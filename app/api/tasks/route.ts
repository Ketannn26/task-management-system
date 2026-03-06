import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask } from "@/lib/tasks";
import { Task } from "@/types/task";

export async function GET(request: NextRequest) {
  let tasks = getAllTasks();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  if (status) {
    tasks = tasks.filter((task) => task.status === status);
  }

  if (priority) {
    tasks = tasks.filter((task) => task.priority === priority);
  }

  if (search) {
    const keyword = search.toLowerCase();
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword),
    );
  }

  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || body.title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!body.dueDate || isNaN(new Date(body.dueDate).getTime())) {
    return NextResponse.json(
      { error: "A valid due date is required" },
      { status: 400 },
    );
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: body.title.trim(),
    description: body.description ?? "",
    priority: body.priority ?? "medium",
    status: body.status ?? "todo",
    dueDate: new Date(body.dueDate).toISOString(),
    createdAt: new Date().toISOString(),
    tags: body.tags ?? [],
    assignedTo: body.assignedTo ?? "",
  };

  const created = createTask(newTask);
  return NextResponse.json(created, { status: 201 });
}