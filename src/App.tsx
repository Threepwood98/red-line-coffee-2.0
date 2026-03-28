import { Suspense, lazy } from "react";
import { Route, Router, Switch } from "wouter";
import { ThemeSwitch } from "./components/ThemeSwitch";
import BottomNav from "./components/BottomNav";

const MenuPage = lazy(() => import("@/components/MenuPage"));
const CatalogPage = lazy(() => import("@/components/CatalogPage"));

// const Pokedex = lazy(() => import("@/components/Pokedex"));
// const MorePage = lazy(() => import("@/components/MorePage"));

// function PlaceholderPage({ title }: { title: string }) {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
//       <h1 className="text-4xl ">{title}</h1>
//       <p className="text-muted-foreground">Página en construcción</p>
//     </div>
//   );
// }

export default function App() {
  // const [pokemonList, setPokemonList] = useState<FullPokemon[]>([]);

  // useEffect(() => {
  //   fetchPokemonList(151).then(setPokemonList);
  // }, []);

  return (
    <Router>
      <header className="flex w-full h-16 px-4 sm:px-8 rounded-b-2xl items-center justify-between bg-primary-foreground">
        <div className="border-2 border-primary size-12 rounded-full overflow-hidden">
          <img
            src="/LOGO_CIRCULAR.webp"
            alt="logo"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <ThemeSwitch />
      </header>

      <main>
        <Suspense
          fallback={
            <div className="flex h-dvh w-full items-center justify-center">
              CARGANDO
            </div>
          }
        >
          <Switch>
            <Route path="/" component={MenuPage} />
            <Route path="/catalog" component={CatalogPage} />
            {/* <Route path="/menu" component={MenuPage} /> */}
            {/* <Route path="/store">
              {() => <PlaceholderPage title="Tienda" />}
            </Route>
            <Route path="/ps4">{() => <PlaceholderPage title="PS4" />}</Route>
            <Route path="/pokedex">
              {() => <Pokedex pokemonList={pokemonList} />}
            </Route>
            <Route path="/more" component={MorePage} /> */}
            {/* <Route>
              {() => <PlaceholderPage title="404 - No encontrado" />}
            </Route> */}
            <Route>
              {() => {
                // En el cliente, redirigimos silenciosamente
                if (typeof window !== "undefined") {
                  window.location.replace("/");
                }
                return <MenuPage />;
              }}
            </Route>
          </Switch>
        </Suspense>
      </main>
      <BottomNav />
    </Router>
  );
}
