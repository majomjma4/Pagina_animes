import { AnimeCard } from "./AnimeCard";

export function CatalogGrid({ items }) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Grid de anime">
      {items.map((anime) => (
        <AnimeCard key={anime.mal_id} anime={anime} />
      ))}
    </section>
  );
}
