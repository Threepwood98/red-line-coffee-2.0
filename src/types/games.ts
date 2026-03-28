export interface RAWGGame {
  id: string;
  name: string;
  name_original: string;
  description: string;
  released: string;
  background_image: string;
  background_image_additional: string;
  genres: { id: number; name: string; slug: string }[];
}

export const GAME_IDS = [
  "gang-beasts",
  "crash-team-racing-nitro-fueled",
  "naruto-x-boruto-ultimate-ninja-storm-connections",
  "mortal-kombat-11",
  "soulcalibur-vi",
] as const;

export interface Game {
  id: string;
  name: string;
  name_original: string;
  description: string;
  released: string;
  background_image: string;
  background_image_additional: string;
  genres: { id: number; name: string; slug: string }[];
  cover: string;
}
