// app/tasks/layout.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { fetchTasks } from "@/store/taskSlice";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <div className="flex flex-col flex-1">
      {children}
    </div>
  );
}