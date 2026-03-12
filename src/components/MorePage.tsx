import { IconPokeball } from "@tabler/icons-react";
import { CrownIcon, SwordsIcon, TrophyIcon } from "lucide-react";
import { useLocation } from "wouter";

const PAGE_ITEMS = [
  { path: "/tournaments", label: "Torneos", Icon: TrophyIcon },
  { path: "/ranking", label: "Ranking", Icon: CrownIcon },
  { path: "/challenges", label: "Retos", Icon: SwordsIcon },
  { path: "/pokedex", label: "Pokédex", Icon: IconPokeball },
];

export default function MorePage() {
  const [location, navigate] = useLocation();

  return (
    <div className="flex flex-col gap-4 sm:gap-8">
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {PAGE_ITEMS.map((page, index) => (
            <button
              key={index}
              className="flex flex-col w-full items-center justify-center border-4 border-primary rounded-4xl text-primary text-2xl font-medium cursor-pointer p-4 bg-primary-foreground"
              onClick={() => navigate(page.path)}
            >
              <page.Icon className="size-16 stroke-1" />
              {page.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
