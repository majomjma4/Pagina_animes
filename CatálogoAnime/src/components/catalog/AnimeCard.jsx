import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";

export function AnimeCard({ anime, detailBasePath = "/detalle" }) {
  const title = anime.title_english || anime.title;
  const studio = anime.studios?.[0] || "Estudio desconocido";
  const year = anime.year || "—";
  const genres = anime.genres || [];
  const fallbackImage = "https://placehold.co/600x900/0e0e0e/cdbdff?text=Anime";
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (event) => {
    event.preventDefault();
    setIsFavorite((prev) => !prev);
  };

  return (
    <article className="group rounded-lg bg-surface-container-low p-4 transition-transform duration-300 ease-snappy hover:scale-[1.02]">
      <Link className="block" to={`${detailBasePath}/${anime.mal_id}`} aria-label={title}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-container-high">
          <img
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 ease-snappy group-hover:scale-[1.03]"
            src={anime.images?.jpg?.image_url || fallbackImage}
            loading="lazy"
          />
          <div className="absolute left-3 top-3">
            <Badge>
              {anime.type} • {anime.episodes ?? "?"} eps
            </Badge>
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full bg-surface/80 p-2 text-primary transition-transform hover:scale-105"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            onClick={toggleFavorite}
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 2).map((genre, index) => (
              <span
                key={`${genre}-${index}`}
                className={`text-xs font-bold uppercase tracking-widest ${
                  index === 0 ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {genre}
              </span>
            ))}
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
          <p className="text-xs text-on-surface-variant">Estudio: {studio} • {year}</p>
        </div>
      </Link>
    </article>
  );
}
