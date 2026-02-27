import { useState, useEffect } from "react";
import { Route, Switch } from "wouter";
import { MenuPage } from "./components/MenuPage";
import { HeroCarousel } from "./components/HeroCarousel";
import { ThemeSwitch } from "./components/ThemeSwitch";
import { FooterBar } from "./components/FooterBar";
import Pokedex from "./components/Pokedex";
import { fetchPokemonList } from "./lib/pokeapi";
import type { FullPokemon } from "./types/pokemon";

const topFive = [
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

function HomePage() {
  return (
    <div className="flex flex-col h-dvh min-h-screen gap-4 sm:gap-8 mt-4 sm:mt-8">
      <HeroCarousel />

      <div className="flex flex-col w-full text-center">
        <h2 className="font-display text-4xl md:text-5xl text-foreground">
          RED LINE TOP 5
        </h2>
        <div className="flex justify-evenly">
          {topFive.map((user) => (
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

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-4xl font-display">{title}</h1>
      <p className="text-muted-foreground">Página en construcción</p>
    </div>
  );
}

export function App() {
  const [pokemonList, setPokemonList] = useState<FullPokemon[]>([]);

  useEffect(() => {
    fetchPokemonList(151).then(setPokemonList);
  }, []);

  return (
    <>
      <header className="flex w-full h-16 px-4 sm:px-8 rounded-b-2xl items-center justify-between bg-primary-foreground">
        <div className="border-2 border-primary size-12 rounded-full overflow-hidden">
          <img
            src="/favicon.ico"
            alt="logo"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <ThemeSwitch />
      </header>

      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/menu" component={MenuPage} />
          <Route path="/store">
            {() => <PlaceholderPage title="Tienda" />}
          </Route>
          <Route path="/ps4">{() => <PlaceholderPage title="PS4" />}</Route>
          <Route path="/pokedex">
            {() => <Pokedex pokemonList={pokemonList} />}
          </Route>
          <Route>{() => <PlaceholderPage title="404 - No encontrado" />}</Route>
        </Switch>
      </main>

      <FooterBar />
    </>
  );
}

export default App;
