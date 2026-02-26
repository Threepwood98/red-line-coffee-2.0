export type Category = "coffees" | "drinks" | "foods" | "sweets";

export interface Product {
  id: string;
  name: string;
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
  { id: "1", name: "Cafés", value: "coffees" },
  { id: "2", name: "Bebidas", value: "drinks" },
  { id: "3", name: "Comidas", value: "foods" },
  { id: "4", name: "Dulces", value: "sweets" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Sakura Dream Cake",
    price: 189.0,
    rating: 0,
    category: "sweets",
    image: "https://picsum.photos/seed/cake1/400/400",
    description: "Pastel de cerezo con crema de vainilla y fresas frescas",
  },
  {
    id: "2",
    name: "Otaku Cookie Supreme",
    price: 45.0,
    rating: 1,
    category: "sweets",
    image: "https://picsum.photos/seed/cookie1/400/400",
    description: "Galleta crujiente con chispas de chocolate y nueces",
  },
  {
    id: "3",
    name: "Dragon Latte",
    price: 95.0,
    rating: 2,
    category: "coffees",
    image: "https://picsum.photos/seed/latte1/400/400",
    description: "Latte con arte de dragón y especias orientales",
  },
  {
    id: "4",
    name: "Cosplay Croissant",
    price: 55.0,
    rating: 3,
    category: "sweets",
    image: "https://picsum.photos/seed/croissant1/400/400",
    description: "Croissant hojaldrado con forma de estrella",
  },
  {
    id: "5",
    name: "Neko Cupcake",
    price: 68.0,
    rating: 4,
    category: "sweets",
    image: "https://picsum.photos/seed/cupcake1/400/400",
    description: "Cupcake con ears de gato y cola de malvavisco",
  },
  {
    id: "6",
    name: "Potion Matcha",
    price: 78.0,
    rating: 5,
    category: "drinks",
    image: "https://picsum.photos/seed/matcha1/400/400",
    description: "Matcha premium estilo hechicero con diseño de póción",
  },
  {
    id: "7",
    name: "Mecha Brownie",
    price: 75.0,
    rating: 4.8,
    category: "sweets",
    image: "https://picsum.photos/seed/brownie1/400/400",
    description: "Brownie de chocolate con decoración futurista",
  },
  {
    id: "8",
    name: "Akuma Cookie",
    price: 35.0,
    rating: 4.1,
    category: "sweets",
    image: "https://picsum.photos/seed/cookie2/400/400",
    description: "Galleta con diseño demoníaco y toque de canela",
  },
  {
    id: "9",
    name: "Sailor Moon Croissant",
    price: 65.0,
    rating: 4.7,
    category: "sweets",
    image: "https://picsum.photos/seed/croissant2/400/400",
    description: "Croissant mágico con glaseado celestial",
  },
  {
    id: "10",
    name: "Spirit Tea",
    price: 58.0,
    rating: 4.3,
    category: "drinks",
    image: "https://picsum.photos/seed/tea1/400/400",
    description: "Té espiritual con burbujas místicas",
  },
  {
    id: "11",
    name: "Pixel Cupcake",
    price: 72.0,
    rating: 4.5,
    category: "sweets",
    image: "https://picsum.photos/seed/cupcake2/400/400",
    description: "Cupcake pixelado estilo retro gamer",
  },
  {
    id: "12",
    name: "Phoenix Cake",
    price: 320.0,
    rating: 5.0,
    category: "sweets",
    image: "https://picsum.photos/seed/cake2/400/400",
    description: "Pastel de celebración con diseño de fénix",
  },
];
