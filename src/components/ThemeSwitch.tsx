import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeSwitchProps {
  className?: string;
}

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return (
    (localStorage.getItem("theme") as Theme) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setThemeState(getInitialTheme());
    setIsMounted(true);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  const isDark = theme === "dark";

  return (
    <button
      className={cn(
        "flex aspect-square items-center justify-center text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary transition-colors cursor-pointer",
        className,
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!isMounted || isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default ThemeSwitch;
