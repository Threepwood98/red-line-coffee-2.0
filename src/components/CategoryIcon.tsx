import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import {
  CakeSliceIcon,
  CoffeeIcon,
  CupSodaIcon,
  LayoutGridIcon,
  SoupIcon,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

interface CategoryIconProps {
  category: Category | "all" | "games";
  className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
  all: LayoutGridIcon,
  coffee: CoffeeIcon,
  drink: CupSodaIcon,
  food: SoupIcon,
  sweet: CakeSliceIcon,
  games: Gamepad2,
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  return <Icon className={cn(className)} />;
}
