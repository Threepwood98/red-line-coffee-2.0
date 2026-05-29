import { cn } from "@/lib/utils";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";

interface RefreshButtonProps {
  className?: string;
}

export function RefreshButton({ className }: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRefresh = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/refresh-data", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `✓ ${data.updated.products} productos y ${data.updated.merchs} artículos actualizados`,
        );
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`✗ Error de conexión`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="flex items-center gap-2">
    //   <button
    //     onClick={handleRefresh}
    //     disabled={loading}
    //     className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    //     title="Actualizar datos desde la BD"
    //   >
    //     {loading ? "Actualizando..." : "🔄 Actualizar BD"}
    //   </button>
    //   {message && (
    //     <span className="text-sm text-foreground/70">
    //       {message}
    //     </span>
    //   )}
    // </div>
    <button
      className={cn(
        "flex aspect-square items-center justify-center text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary transition-colors cursor-pointer",
        loading && "animate-spin",
        className,
      )}
      onClick={handleRefresh}
    >
      <RefreshCwIcon />
    </button>
  );
}

export default RefreshButton;
