import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import ProductTCG from "./ProductTCG";
import { cn } from "@/lib/utils";
import { categories, type Category, type Product } from "@/types";
import { useElementRefs } from "@/hooks/useElementRefs";
import ModalFlip from "./ModalFlip";

const allCategories = [
  { id: "0", name: "Todo", value: "all" as Category | "all" },
  ...categories,
];

type ActiveCategory = Category | "all";

/**
 * Estructura que guardamos en modalStateRef para poder restaurar el estado del
 * modal (posición de origen de la carta) si los productos se recargan mientras
 * el modal estaba abierto.
 *
 * IMPORTANTE: guardamos `scrollY` en el momento de apertura porque DOMRect.y
 * es relativo al viewport, no al documento. Para restaurar la posición correcta
 * de la carta necesitamos: rect.top + scrollY al momento de abrir.
 */
interface ModalState {
  productId: string;
  originRect: DOMRectInit;
  scrollYAtOpen: number; // FIX #7: guardamos el scrollY real al momento de abrir
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory | null>(
    "all",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX #6: modalStateRef se popula al abrir el modal y se limpia al cerrarlo.
  // Permite que useLayoutEffect restaure el modal si los productos se recargan.
  const modalStateRef = useRef<ModalState | null>(null);

  const { setRef, getRect } = useElementRefs<Product>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [animate, setAnimate] = useState<"open" | "close">("open");

  const filtered = useMemo(
    () =>
      activeCategory === "all" || activeCategory === null
        ? products
        : products.filter((p) => p.category === activeCategory),
    [activeCategory, products],
  );

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

  // ─── Restauración del modal al recargar productos ──────────────────────────
  useLayoutEffect(() => {
    const modalState = modalStateRef.current;
    if (!modalState?.productId || !modalState.originRect) return;

    // FIX #7: Restauramos al scrollY exacto en que estaba el usuario cuando
    // abrió el modal, no al `y` del rect que es relativo al viewport.
    window.scrollTo(0, modalState.scrollYAtOpen);

    requestAnimationFrame(() => {
      const product = products.find((p) => p.id === modalState.productId);
      if (product) {
        setOriginRect(
          new DOMRect(
            modalState.originRect.x ?? 0,
            modalState.originRect.y ?? 0,
            modalState.originRect.width ?? 0,
            modalState.originRect.height ?? 0,
          ),
        );
        setSelectedProduct(product);
        setAnimate("close");
      }
    });
  }, [products]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-8 pt-4 pb-16">
      {/* Barra de categorías fija en la parte superior */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xs shadow-sm">
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
            {filtered.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <div
                  key={product.id}
                  ref={setRef(product.id)}
                  className={cn(
                    "cursor-pointer transition-opacity duration-1000",
                    isSelected && "invisible",
                  )}
                  onClick={() => {
                    const rect = getRect(product.id);
                    if (rect) {
                      // FIX #6 + #7: Populamos modalStateRef con el estado
                      // completo incluyendo scrollY al momento exacto de apertura.
                      modalStateRef.current = {
                        productId: product.id,
                        originRect: {
                          x: rect.left,
                          y: rect.top,
                          width: rect.width,
                          height: rect.height,
                        },
                        scrollYAtOpen: window.scrollY,
                      };
                      setOriginRect(rect);
                      setSelectedProduct(product);
                      setAnimate("open");
                    }
                  }}
                >
                  <ProductTCG product={product} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProduct && originRect && (
        <ModalFlip
          productId={selectedProduct.id}
          faceA={<ProductTCG product={selectedProduct} />}
          faceB={<ProductTCG product={selectedProduct} />}
          originRect={originRect}
          animate={animate}
          setAnimate={setAnimate}
          onClose={() => {
            // FIX #6: Limpiamos la referencia al cerrar para que el
            // useLayoutEffect no intente restaurar un modal ya cerrado.
            modalStateRef.current = null;
            setSelectedProduct(null);
            setOriginRect(null);
            setAnimate("open");
          }}
        />
      )}
    </div>
  );
}
