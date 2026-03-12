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
  category: string;
  className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
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
