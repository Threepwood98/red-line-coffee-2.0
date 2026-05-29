import { useRef, useState, useCallback } from "react";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Product, type Rarity } from "@/types";
import { CategoryIcon } from "./CategoryIcon";

interface ProductTCGProps {
  product: Product;
  className?: string;
}

function getRarityFromRating(rating: number): Rarity {
  if (rating <= 1) return "common";
  if (rating <= 2) return "uncommon";
  if (rating <= 3) return "rare";
  if (rating <= 4) return "epic";
  return "legendary";
}

export default function ProductTCG({ product, className }: ProductTCGProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
    setMousePosition({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  const tiltStyle = isHovered
    ? {
        transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg) scale(1.02)`,
        transition: "transform 0.1s ease-out",
      }
    : {};

  const holoOverlay = isHovered ? (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 dark:opacity-100"
      style={{
        background: `linear-gradient(
          ${135 + mousePosition.x * 45}deg,
          transparent 0%,
          rgba(192, 192, 192, 0.15) 25%,
          rgba(220, 220, 220, 0.35) 50%,
          rgba(192, 192, 192, 0.15) 75%,
          transparent 100%
        )`,
        animation: "holo-shimmer 2s ease-in-out infinite",
      }}
    />
  ) : null;

  const darkHoloOverlay = isHovered ? (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
      style={{
        background: `linear-gradient(
          ${135 + mousePosition.x * 45}deg,
          transparent 0%,
          rgba(255, 255, 255, 0.1) 25%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.1) 75%,
          transparent 100%
        )`,
        animation: "holo-shimmer 2s ease-in-out infinite",
      }}
    />
  ) : null;

  const rarity = getRarityFromRating(product.rating);
  const isNR = product.rating === 0;

  const rarityStyles = {
    common: {
      star: "fill-gray-800",
      border: "border-gray-300 border",
      glow: "shadow-gray-300/30",
      gradient:
        "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 text-gray-800",
    },
    uncommon: {
      star: "fill-green-950",
      border: "border-green-400 border",
      glow: "shadow-green-400/30",
      gradient:
        "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-green-950",
    },
    rare: {
      star: "fill-blue-950",
      border: "border-blue-400 border-2",
      glow: "shadow-blue-400/50",
      gradient:
        "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-blue-950",
    },
    epic: {
      star: "fill-purple-950",
      border: "border-purple-400 border-2",
      glow: "shadow-purple-400/50",
      gradient:
        "bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 text-purple-950",
    },
    legendary: {
      star: "fill-amber-950",
      border: "border-amber-400 border-2",
      glow: "shadow-amber-400/50",
      gradient:
        "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-amber-950",
    },
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "border-2 rounded-xl relative cursor-pointer transition-all duration-300 ease-out bg-primary-foreground",
        isHovered && !isNR
          ? "shadow-2xl " + rarityStyles[rarity].glow
          : "shadow-xl",
        className,
      )}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "border-b-2 flex justify-between rounded-t-xl px-3 sm:px-6 pt-2 sm:pt-4 transition-all duration-300",
          !isNR ? rarityStyles[rarity].gradient : "py-1.5 sm:py-2.5",
        )}
      >
        <CategoryIcon category={product.category} />
        <span className="flex gap-0.5 font-bebas-neue text-xl sm:text-xl">
          <StarIcon className={cn(!isNR && rarityStyles[rarity].star)} />
          {!isNR && product.rating.toFixed(1)}
        </span>
      </div>
      <div className="px-3 sm:px-6 py-3 sm:py-6 transition-all duration-300">
        <div className="dark:hidden">{holoOverlay}</div>
        <div className="hidden dark:block">{darkHoloOverlay}</div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="relative aspect-square rounded-xl w-full overflow-hidden">
            <img
              src={imageError ? "/No_Image_Available.webp" : product.image}
              alt={product.nameES}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="text-center uppercase">
            <span className="block font-bebas-neue sm:text-lg text-accent-foreground">
              {product.nameJP}
            </span>
            <span className="block font-rajdhani text-xs sm:text-sm text-accent-foreground italic">
              {product.nameES}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t-2 flex justify-between rounded-b-xl font-bebas-neue text-xl sm:text-xl px-3 sm:px-6 pt-1 sm:pt-2">
        <span>$ {product.price}</span>
        <span>+ {(product.price * 0.1).toFixed(2)}</span>
      </div>
    </div>
  );
}
