export type Category = "Coffee" | "Drink" | "Food" | "Sweet";

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
  { id: "1", name: "Cafés", value: "Coffee" },
  { id: "2", name: "Bebidas", value: "Drink" },
  { id: "3", name: "Comidas", value: "Food" },
  { id: "4", name: "Dulces", value: "Sweet" },
];

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
