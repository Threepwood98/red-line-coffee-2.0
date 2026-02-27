export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonTypeDetail {
  name: string;
  url: string;
}

export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  other: {
    "official-artwork": {
      front_default: string;
    };
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonTypeDetail[];
  sprites: PokemonSprites;
  stats: PokemonStat[];
}

export interface PokemonListItem {
  name: string;
  url: string;
  id?: number;
  image?: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonTypeGraphQL {
  pokemon_v2_type: {
    name: string;
  };
}

export interface PokemonSpritesGraphQL {
  sprites: string;
}

export interface PokemonCriesGraphQL {
  cries: string;
}

export interface PokemonGenerationGraphQL {
  pokemon_v2_generation: {
    name: string;
  };
}

export interface PokemonGraphQL {
  id: number;
  name: string;
  pokemon_v2_pokemonsprites: PokemonSpritesGraphQL[];
  pokemon_v2_pokemontypes: PokemonTypeGraphQL[];
  pokemon_v2_pokemoncries: PokemonCriesGraphQL[];
  pokemon_v2_pokemonspecy: PokemonGenerationGraphQL[];
}

export interface PokemonApiResponse {
  data: {
    pokemon_v2_pokemon: PokemonGraphQL[];
  };
}

export interface FullPokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  cry: string;
  generation: string;
}
