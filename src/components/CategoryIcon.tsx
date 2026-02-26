import type { Category } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import {
  CakeSliceIcon,
  CoffeeIcon,
  CupSodaIcon,
  SoupIcon,
  type LucideIcon,
} from "lucide-react";

interface CategoryIconProps {
  category: Category;
  className?: string;
}

const categoryIcons: Record<Category, LucideIcon> = {
  coffees: CoffeeIcon,
  drinks: CupSodaIcon,
  foods: SoupIcon,
  sweets: CakeSliceIcon,
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  return <Icon className={cn(className)} />;
}
