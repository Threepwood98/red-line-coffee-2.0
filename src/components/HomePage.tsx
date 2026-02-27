import HeroCarousel from "./HeroCarousel";

const TOP_FIVE = [
  {
    id: 1,
    name: "SakuraKnight",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SakuraKnight",
    points: 12500,
    rank: 1,
  },
  {
    id: 2,
    name: "CoffeMage",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CoffeMage",
    points: 10200,
    rank: 2,
  },
  {
    id: 3,
    name: "ByteWizard",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ByteWizard",
    points: 9800,
    rank: 3,
  },
  {
    id: 4,
    name: "LatteRogue",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LatteRogue",
    points: 8400,
    rank: 4,
  },
  {
    id: 5,
    name: "EspressoHunter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=EspressoHunter",
    points: 7200,
    rank: 5,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col h-dvh min-h-screen gap-4 sm:gap-8 mt-4 sm:mt-8">
      <HeroCarousel />

      <div className="flex flex-col w-full text-center">
        <h2 className="font-display text-4xl md:text-5xl text-foreground">
          RED LINE TOP 5
        </h2>
        <div className="flex justify-evenly">
          {TOP_FIVE.map((user) => (
            <div key={user.id} className="relative">
              <div className="border-2 size-18 bg-primary-foreground rounded-full overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 font-display text-3xl text-yellow-600">
                {user.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
