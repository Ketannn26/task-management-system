// app/tasks/error.tsx
"use client"; // error files must be client components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TasksError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Tasks page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="p-4 rounded-full bg-red-50 dark:bg-red-950 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || "An unexpected error occurred while loading tasks."}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}