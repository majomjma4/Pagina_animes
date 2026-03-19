import { Link } from "react-router-dom";
import navItems from "../../data/navigation.json";
import { Button } from "../ui/Button";

export function Navbar({ user }) {
  const fallbackAvatar = "https://placehold.co/160x160/0e0e0e/cdbdff?text=User";
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-xl shadow-elevated">
      <nav className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-6" aria-label="Navegación principal">
        <Link className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-on-surface" to="/" aria-label="CinemaCurator inicio">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            movie_filter
          </span>
          CinemaCurator
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                className={
                  isActive
                    ? "border-b-2 border-primary pb-1 text-primary font-bold"
                    : "text-on-surface-variant transition-colors hover:text-on-surface"
                }
                to={item.path}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 lg:flex">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-on-surface-variant/70"
              type="search"
              placeholder="Buscar títulos..."
              aria-label="Buscar en catálogo"
            />
          </label>
          <button
            className="rounded-full p-2 transition-transform hover:scale-105"
            type="button"
            aria-label="Favoritos"
            onClick={() => {}}
          >
            <span className="material-symbols-outlined text-primary">favorite</span>
          </button>
          <Button className="md:hidden" variant="ghost" aria-label="Abrir menú">
            <span className="material-symbols-outlined text-on-surface">menu</span>
          </Button>
          <Link className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant" to="/perfil" aria-label="Perfil de usuario">
            <img
              alt={`Avatar de ${user.name}`}
              className="h-full w-full object-cover"
              src={user.avatar || fallbackAvatar}
              loading="lazy"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}
