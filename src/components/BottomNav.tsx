import { useLocation } from "wouter";
import {
  CoffeeIcon,
  StoreIcon,
  Gamepad2Icon,
  EllipsisIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Menú", Icon: CoffeeIcon },
  { path: "/store", label: "Tienda", Icon: StoreIcon },
  { path: "/ps4", label: "PS4", Icon: Gamepad2Icon },
  { path: "/more", label: "Más", Icon: EllipsisIcon },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  // const isActive = (path: string) => {
  //   if (path === "/") return location === "/";
  //   return location.startsWith(path);
  // };

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.path === "/" ? location === "/" : location.startsWith(item.path),
  );

  return (
    <nav
      className="fixed bottom-0 z-10 flex w-full h-16 items-center justify-around bg-primary-foreground"
      role="navigation"
    >
      {NAV_ITEMS.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={item.path}
            className={cn(
              "flex flex-col w-full items-center justify-center border-b-2 border-transparent cursor-pointer transition-colors",
              isActive
                ? "text-primary border-b-2 border-primary"
                : "hover:border-primary dark:hover:border-primary text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary",
            )}
            onClick={() => navigate(item.path)}
          >
            <item.Icon />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
