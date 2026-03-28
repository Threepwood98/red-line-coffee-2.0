import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { type Game } from "@/types/games";

interface GameCardProps {
  game: Game;
  className?: string;
}

function optimizeImage(src: string, width: number) {
  return `/_image?href=${encodeURIComponent(src)}&w=${width}&f=webp&q=75`;
}

export default function GameCard({ game, className }: GameCardProps) {
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

  const imgSrc = game.cover || game.background_image;

  return (
    <div
      ref={cardRef}
      className={cn(
        "border-2 rounded-xl relative cursor-pointer transition-all duration-300 ease-out bg-primary-foreground shadow-xl",
        className,
      )}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="transition-all duration-300">
        <div className="dark:hidden">{holoOverlay}</div>
        <div className="hidden dark:block">{darkHoloOverlay}</div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={
                imageError
                  ? "/No_Image_Available.webp"
                  : optimizeImage(imgSrc, 256)
              }
              alt={game.name_original}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
