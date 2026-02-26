import { useState } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProductTCG } from "@/components/ProductTCG";
import { categories, products, type Category } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <div className="flex flex-col h-dvh min-h-screen gap-4 sm:gap-8">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs border-b">
        <div className="flex flex-col gap-2 sm:gap-4 py-4 sm:py-8">
          <h1 className="font-display text-3xl">Menú</h1>
          <div className="flex justify-between">
            {categories.map((ctg) => (
              <button
                key={ctg.id}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === ctg.value ? null : ctg.value,
                  )
                }
                className={cn(
                  "flex gap-0.5 border-2 rounded-xl px-2 py-1 text-sm font-medium items-center transition-colors",
                  activeCategory === ctg.value
                    ? "border-primary text-primary"
                    : "border-neutral-600 hover:border-primary dark:border-neutral-400 dark:hover:border-primary text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary",
                )}
              >
                <CategoryIcon category={ctg.value} /> {ctg.name}
              </button>
            ))}
          </div>
        </div>
      </header>

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
