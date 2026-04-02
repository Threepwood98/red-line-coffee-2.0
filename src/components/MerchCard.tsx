import { useRef, useState, useCallback } from "react";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Merch, type Rarity } from "@/types";
import { CategoryIcon } from "./CategoryIcon";

interface MerchCardProps {
  merch: Merch;
  className?: string;
}

export default function MerchCard({ merch, className }: MerchCardProps) {
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

  return (
    <div
      ref={cardRef}
      className={cn(
        "border-2 rounded-xl relative cursor-pointer transition-all duration-300 ease-out bg-primary-foreground",
        isHovered && "shadow-xl",
        className,
      )}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-3 sm:px-6 py-3 sm:py-6 transition-all duration-300">
        <div className="dark:hidden">{holoOverlay}</div>
        <div className="hidden dark:block">{darkHoloOverlay}</div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="relative aspect-square rounded-xl w-full overflow-hidden">
            <img
              src={
                imageError
                  ? "/No_Image_Available.webp"
                  : `/api/products/${merch.id}/image`
              }
              alt={merch.nameES}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="text-center uppercase">
            <span className="block font-bebas-neue text-lg sm:text-xl text-accent-foreground">
              {merch.nameES}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t-2 flex justify-between rounded-b-xl font-bebas-neue px-3 sm:px-6 pt-1 sm:pt-2">
        <span>{merch.price.toFixed(2)} USD</span>
        <span>c/u</span>
      </div>
    </div>
  );
}
