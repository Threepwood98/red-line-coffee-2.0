import type { FullPokemon } from "@/types/pokemon";

const GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta";

const POKEMON_QUERY = `
  query GetPokemon($limit: Int) {
    pokemon_v2_pokemon(limit: $limit, order_by: {id: asc}) {
      id
      name
      pokemon_v2_pokemonsprites {
        sprites
      }
      pokemon_v2_pokemontypes {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemoncries {
        cries
      }
      pokemon_v2_pokemonspecy {
        pokemon_v2_generation {
          name
        }
      }
    }
  }
`;

export async function fetchPokemonList(
  limit: number = 151,
): Promise<FullPokemon[]> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: POKEMON_QUERY,
      variables: { limit },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  const pokemonList = result.data.pokemon_v2_pokemon;

  return pokemonList.map((pokemon: any) => {
    return {
      id: pokemon.id,
      name: pokemon.name,
      // image:
      //   pokemon.pokemon_v2_pokemonsprites[0]?.sprites.other?.[
      //     "official-artwork"
      //   ]?.front_default || "",
      image: pokemon.pokemon_v2_pokemonsprites[0]?.sprites.front_default || "",
      types: pokemon.pokemon_v2_pokemontypes.map(
        (t: any) => t.pokemon_v2_type.name,
      ),
      cry: pokemon.pokemon_v2_pokemoncries[0]?.cries?.latest || "",
      generation:
        pokemon.pokemon_v2_pokemonspecy.pokemon_v2_generation?.name || "",
    };
  });
}

export function formatPokemonId(id: number): string {
  return `Nº ${String(id).padStart(3, "0")}`;
}
