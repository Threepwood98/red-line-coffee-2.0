import { useLocation } from "wouter";
import { CoffeeIcon, HouseIcon, StoreIcon, Gamepad2Icon } from "lucide-react";
import { IconPokeball } from "@tabler/icons-react";

const NAV_ITEMS = [
  { path: "/", label: "Home", Icon: HouseIcon },
  { path: "/menu", label: "Menú", Icon: CoffeeIcon },
  { path: "/store", label: "Tienda", Icon: StoreIcon },
  { path: "/ps4", label: "PS4", Icon: Gamepad2Icon },
  { path: "/pokedex", label: "Pokédex", Icon: IconPokeball },
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
      className="fixed bottom-0 z-10 flex w-full h-16 py-4 items-center justify-around bg-primary-foreground"
      role="navigation"
    >
      {NAV_ITEMS.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={item.path}
            className={`flex flex-col items-center transition-colors ${
              isActive
                ? "text-primary"
                : "text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary"
            }`}
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
