export function CatalogHeader({ title, subtitle }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">{title}</h1>
        <p className="text-on-surface-variant">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-on-surface-variant">
        <span>Ordenar por:</span>
        <button className="flex items-center gap-1 font-bold text-on-surface" type="button" aria-label="Ordenar resultados">
          Popularidad <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
      </div>
    </header>
  );
}
