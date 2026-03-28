import { useState, useEffect } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import ProductTCG from "./ProductTCG";
import { cn } from "@/lib/utils";
import { categories, type Category, type Product } from "@/types";

const allCategories = [
  { id: "0", name: "Todo", value: "all" as Category | "all" },
  ...categories,
];

type ActiveCategory = Category | "all";

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory | null>(
    "all",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered =
    activeCategory === "all" || activeCategory === null
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        {/* <HeroCarousel /> */}
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        {/* <HeroCarousel /> */}
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-8 pt-4 pb-16">
      {/* <HeroCarousel /> */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xs shadow-sm">
        <div className="flex flex-col">
          <h1 className="font-bebas-neue text-4xl">Menú</h1>
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
        {filtered.length === 0 ? (
          <p className="text-center text-lg text-neutral-500">
            No hay productos en esta categoría
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductTCG key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MenuPage;
