export type Category = "coffee" | "drink" | "food" | "sweet";

export interface Product {
  id: string;
  nameES: string;
  nameJP: string;
  price: number;
  rating: number;
  category: Category;
  image: string;
  description: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  value: Category;
}

export const categories: CategoryItem[] = [
  { id: "1", name: "Cafés", value: "coffee" },
  { id: "2", name: "Bebidas", value: "drink" },
  { id: "3", name: "Comidas", value: "food" },
  { id: "4", name: "Dulces", value: "sweet" },
];

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
