import type { Category } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import {
  CakeSliceIcon,
  CoffeeIcon,
  CupSodaIcon,
  LayoutGridIcon,
  SoupIcon,
  type LucideIcon,
} from "lucide-react";

interface CategoryIconProps {
  category: Category | "all";
  className?: string;
}

const categoryIcons: Record<Category | "all", LucideIcon> = {
  all: LayoutGridIcon,
  coffees: CoffeeIcon,
  drinks: CupSodaIcon,
  foods: SoupIcon,
  sweets: CakeSliceIcon,
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  return <Icon className={cn(className)} />;
}
