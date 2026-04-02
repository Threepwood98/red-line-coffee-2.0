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
  { path: "/catalog", label: "PS4", Icon: Gamepad2Icon },
  { path: "/more", label: "Más", Icon: EllipsisIcon },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.path === "/" ? location === "/" : location.startsWith(item.path),
  );

  return (
    <div className="fixed w-full h-18 px-6 bottom-0 z-10 bg-linear-to-t from-black/75 to-transparent">
      <nav
        className="flex w-full h-14 p-1 items-center justify-around rounded-full bg-primary-foreground"
        role="navigation"
      >
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={item.path}
              className={cn(
                "flex flex-col w-full h-full py-0.5 items-center justify-center cursor-pointer transition-colors rounded-full text-primary",
                isActive
                  ? "bg-destructive/25 text-destructive"
                  : "hover:bg-destructive/10",
              )}
              onClick={() => navigate(item.path)}
            >
              <item.Icon />
              <span
                className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
