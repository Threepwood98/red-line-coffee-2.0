import { cn } from "@/lib/utils";
import {
  CakeSliceIcon,
  CoffeeIcon,
  CupSodaIcon,
  LayoutGridIcon,
  SoupIcon,
  type LucideIcon,
} from "lucide-react";

type Category = "coffee" | "drink" | "food" | "sweet";

interface CategoryIconProps {
  category: Category | "all";
  className?: string;
}

const categoryIcons: Record<Category | "all", LucideIcon> = {
  all: LayoutGridIcon,
  coffee: CoffeeIcon,
  drink: CupSodaIcon,
  food: SoupIcon,
  sweet: CakeSliceIcon,
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  return <Icon className={cn(className)} />;
}
