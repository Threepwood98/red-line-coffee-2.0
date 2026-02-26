import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const ads = [
  "https://picsum.photos/seed/promo1/800/450",
  "https://picsum.photos/seed/promo2/800/450",
  "https://picsum.photos/seed/promo3/800/450",
  "https://picsum.photos/seed/promo4/800/450",
];

export function HeroCarousel() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: false,
          stopOnFocusIn: true,
          stopOnMouseEnter: true,
        }),
      ]}
      className="w-full"
      opts={{
        loop: true,
        align: "center",
      }}
    >
      <CarouselContent>
        {ads.map((image, index) => (
          <CarouselItem key={index}>
            <div className="flex aspect-video items-center justify-center relative rounded-xl shadow-lg overflow-hidden">
              <img
                src={image}
                alt={`Ad #${index + 1}`}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 md:left-4 z-20 hidden md:flex" />
      <CarouselNext className="right-2 md:right-4 z-20 hidden md:flex" />
    </Carousel>
  );
}

export default HeroCarousel;
