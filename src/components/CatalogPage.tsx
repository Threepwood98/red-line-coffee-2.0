import { useState, useEffect } from "react";
import { type Game } from "@/types/games";
import GameCard from "./GameCard";

export default function CatalogPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("/api/games");
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg">Cargando catálogo de PS4...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-8 pt-4 pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs shadow-sm">
        <h1 className="font-bebas-neue text-4xl text-center my-2">
          Catálogo PS4
        </h1>
      </div>
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  );
}
