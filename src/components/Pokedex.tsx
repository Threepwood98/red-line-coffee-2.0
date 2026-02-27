import { useState } from "react";
import PokemonCard from "@/components/PokemonCard";
import { Input } from "@/components/ui/input";
import { ScanLineIcon } from "lucide-react";
import type { FullPokemon } from "@/types/pokemon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { formatPokemonId } from "@/lib/pokeapi";

const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

interface PokedexProps {
  pokemonList: FullPokemon[];
}

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

export default function Pokedex({ pokemonList }: PokedexProps) {
  const [searchName, setSearchName] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const generations = Array.from(
    new Set(pokemonList.map((p) => p.generation)),
  ).sort();

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesGeneration =
      selectedGeneration === "all" || pokemon.generation === selectedGeneration;
    const matchesType =
      selectedType === "all" || pokemon.types.includes(selectedType);
    return matchesName && matchesGeneration && matchesType;
  });
  return (
    <div className="flex flex-col gap-4 sm:gap-8 pb-16">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs">
        <div className="flex flex-col gap-4 sm:gap-8 px-4 sm:px-8">
          <h1 className="text-3xl">Pokédex</h1>
          <div className="grid sm:grid-cols-2 gap-2">
            <Input
              placeholder="Buscar por nombre..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full"
            />
            <div className="w-full grid grid-cols-2 gap-2">
              <Select
                value={selectedGeneration}
                onValueChange={setSelectedGeneration}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Generaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todas las Generaciones</SelectItem>
                    {generations.map((gen) => (
                      <SelectItem key={gen} value={gen}>
                        {gen.replace("generation-", "Gen ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos los Tipos</SelectItem>
                    {POKEMON_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {filteredPokemon.map((pokemon) => (
          <a
            key={pokemon.id}
            href="#"
            className="flex gap-2 sm:gap-4 border-b-2 items-center h-20 px-4 sm:px-8 py-2 sm:py-4"
          >
            <img
              src={pokemon.image}
              alt={pokemon.id.toString()}
              className="aspect-square h-full border rounded-xl p-1 bg-neutral-600 dark:bg-neutral-400"
            />
            <div className="flex flex-col flex-1 h-full justify-between font-medium">
              <span>{formatPokemonId(pokemon.id)}</span>
              <span className="uppercase text-lg">{pokemon.name}</span>
            </div>
            <div className="flex flex-col h-full justify-between font-medium">
              <div className="flex gap-2 justify-end">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className={`px-2 py-0.5 rounded-sm text-white capitalize ${
                      typeColors[type] || "bg-gray-500"
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <span className="uppercase text-lg text-end">
                {pokemon.generation}
              </span>
            </div>
          </a>
        ))}
      </div>
      <a
        className="flex fixed bottom-20 right-4 sm:right-8 aspect-square rounded-xl size-14 bg-primary shadow-lg items-center justify-center"
        href="/pokescan"
      >
        <ScanLineIcon className="size-8 text-accent" />
      </a>
      {/* <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      </div> */}
    </div>
  );
}
