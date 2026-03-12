import type { FullPokemon } from "@/types/pokemon";
import { formatPokemonId } from "@/lib/pokeapi";

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-500",
  grass: "bg-green-500",
  ice: "bg-cyan-400",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-500",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-slate-400",
  fairy: "bg-pink-300",
};

interface PokemonCardProps {
  pokemon: FullPokemon;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const id = formatPokemonId(pokemon.id);
  const generation = pokemon.generation?.replace("generation-", "Gen ") || "";

  return (
    <div className="group relative bg-card rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border">
      <div className="absolute top-2 left-2 text-xs font-mono text-muted-foreground">
        {id}
      </div>
      {generation && (
        <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground">
          {generation}
        </div>
      )}

      <div className="flex justify-center items-center h-32 mb-2">
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="w-24 h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="text-center">
        <h3 className="font-bold text-lg capitalize text-foreground">
          {pokemon.name}
        </h3>

        <div className="flex justify-center gap-1 mt-2">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={`px-2 py-0.5 text-xs rounded-full text-white capitalize ${
                typeColors[type] || "bg-gray-500"
              }`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
