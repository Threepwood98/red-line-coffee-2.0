import { useState } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProductTCG } from "@/components/ProductTCG";
import { categories, products, type Category } from "@/lib/data/products";
import { cn } from "@/lib/utils";

type ActiveCategory = Category | "all";

const allCategories = [
  { id: "0", name: "Todo", value: "all" as ActiveCategory },
  ...categories,
];

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory | null>(
    "all",
  );

  const filtered =
    activeCategory === "all" || activeCategory === null
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col gap-4 sm:gap-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs">
        <div className="felx flex-col gap-4 sm:gap-8">
          <h1 className="text-3xl">Menú</h1>
          <div className="flex">
            {allCategories.map((ctg) => (
              <button
                key={ctg.id}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === ctg.value ? "all" : ctg.value,
                  )
                }
                className={cn(
                  "flex flex-col w-full items-center justify-center text-sm font-medium py-2 sm:py-2 border-b-2 border-transparent cursor-pointer transition-colors",
                  activeCategory === ctg.value
                    ? "text-primary border-b-2 border-primary"
                    : "hover:border-primary dark:hover:border-primary text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary",
                )}
              >
                <CategoryIcon category={ctg.value} /> {ctg.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductTCG key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default MenuPage;
