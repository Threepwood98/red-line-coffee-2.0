import { cn } from "@/lib/utils";
import type { Category } from "@/types";
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
  Coffee: CoffeeIcon,
  Drink: CupSodaIcon,
  Food: SoupIcon,
  Sweet: CakeSliceIcon,
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  return <Icon className={cn(className)} />;
}
