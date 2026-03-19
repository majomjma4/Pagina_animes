import { Button } from "../ui/Button";
import { SearchInput } from "../ui/SearchInput";
import { SelectField } from "../ui/SelectField";

export function SidebarFilters({ filters }) {
  return (
    <section className="sticky top-28 rounded-lg bg-surface-container-low p-6" aria-label="Filtros">
      <h2 className="font-headline text-xl font-bold text-on-surface">Filtros</h2>
      <div className="mt-6 space-y-6">
        <SearchInput id="filter-search" label="Buscar" placeholder="Ej: Frieren" />
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Géneros</label>
          <div className="flex flex-wrap gap-2">
            {filters.genres.map((genre, index) => (
              <Button
                key={genre}
                variant={index === 0 ? "primary" : "ghost"}
                className="px-4 py-2 text-xs font-semibold"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SelectField id="filter-year" label="Año" options={filters.years} />
          <SelectField id="filter-type" label="Tipo" options={filters.types} />
          <SelectField id="filter-status" label="Estado" options={filters.statuses} />
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 py-3 text-sm">Reiniciar</Button>
          <Button className="flex-1 py-3 text-sm">Aplicar</Button>
        </div>
      </div>
    </section>
  );
}
