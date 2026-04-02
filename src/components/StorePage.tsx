import { useState, useEffect } from "react";
import ProductTCG from "./ProductTCG";
import { type Merch } from "@/types";
import MerchCard from "./MerchCard";

export default function StorePage() {
  const [merchs, setMerchs] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchs = async () => {
      try {
        const res = await fetch("/api/merchs");
        if (!res.ok) throw new Error("Failed to fetch merchs");
        const data = await res.json();
        setMerchs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMerchs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 pt-4">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-lg">Cargando tienda...</p>
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
    <div className="flex flex-col gap-4 sm:gap-8 pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs shadow-sm">
        <h1 className="font-bebas-neue text-4xl text-center my-2">Tienda</h1>
      </div>
      <main className="container mx-auto px-4">
        {merchs.length === 0 ? (
          <p className="text-center text-lg text-neutral-500">
            No hay productos en esta categoría
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {merchs.map((merch) => (
              <MerchCard key={merch.id} merch={merch} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
