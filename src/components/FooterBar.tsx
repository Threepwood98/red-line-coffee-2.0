import { useLocation } from "wouter";
import { CoffeeIcon, HouseIcon, StoreIcon, Gamepad2Icon } from "lucide-react";
import { IconPokeball } from "@tabler/icons-react";

const navItems = [
  { path: "/", Icon: HouseIcon, label: "Home" },
  { path: "/menu", Icon: CoffeeIcon, label: "Menú" },
  { path: "/store", Icon: StoreIcon, label: "Tienda" },
  { path: "/ps4", Icon: Gamepad2Icon, label: "PS4" },
  { path: "/pokedex", Icon: IconPokeball, label: "Pokédex" },
];

export function FooterBar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 z-10 flex w-full h-16 py-4 items-center justify-around bg-primary-foreground">
      {navItems.map((item) => {
        const Icon = item.Icon;
        return (
          <a
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center transition-colors ${
              isActive(item.path)
                ? "text-primary"
                : "text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary"
            }`}
          >
            <Icon />
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default FooterBar;
