"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Kanban } from "lucide-react";
import { useSyncExternalStore } from "react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const mounted = useIsMounted();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-shadow">
            <Kanban className="h-4 w-4" />
          </div>
          <div className="flex gap-1 items-center text-xl">
            <span className="text-xl font-bold">Centripe</span>
            <span className="text-xl">Flow</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium hidden sm:block">
            {pathname === "/tasks"
              ? "📋 Board"
              : pathname === "/create"
                ? "✏️ New Task"
                : pathname.includes("/edit")
                  ? "✏️ Edit Task"
                  : ""}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-lg"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </Button>
        </div>

      </div>
    </nav>
  );
}