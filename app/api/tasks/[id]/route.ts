// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTask, deleteTask } from "@/lib/tasks";


interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── GET /api/tasks/[id] ──────────────────────────────────
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params; // ← await params first
  const task = getTaskById(id);

  if (!task) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(task, { status: 200 });
}

// ─── PUT /api/tasks/[id] ──────────────────────────────────
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params; // ← await params first
  const body = await request.json();

  const updated = updateTask(id, body);

  if (!updated) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated, { status: 200 });
}

// ─── DELETE /api/tasks/[id] ───────────────────────────────
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params; // ← await params first

  const deleted = deleteTask(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { message: "Task deleted" },
    { status: 200 }
  );
}