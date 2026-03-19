import { SidebarFilters } from "../components/catalog/SidebarFilters";
import { CatalogHeader } from "../components/catalog/CatalogHeader";
import { CatalogGrid } from "../components/catalog/CatalogGrid";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/SkeletonCard";

export function CatalogPage({ items, total, loading, error, onRetry, filters }) {
  const isEmpty = !loading && !error && items.length === 0;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <SidebarFilters filters={filters} />
      </aside>

      <section className="lg:col-span-9" aria-label="Resultados de catálogo">
        <CatalogHeader title="Descubrimiento" subtitle={`Mostrando ${total} títulos seleccionados para ti`} />

        <section className="space-y-6" aria-live="polite">
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))}
            </div>
          )}

          {error && (
            <ErrorState
              title="Ocurrió un error"
              message="No pudimos cargar el catálogo. Inténtalo nuevamente."
              cta="Reintentar"
              onRetry={onRetry}
            />
          )}

          {isEmpty && (
            <EmptyState
              title="Sin resultados"
              message="Prueba otros filtros para ver más títulos disponibles."
              cta="Limpiar filtros"
              onAction={onRetry}
            />
          )}
        </section>

        {!loading && !error && !isEmpty && <CatalogGrid items={items} />}

        {!loading && !error && !isEmpty && (
          <div className="mt-12 flex justify-center">
            <Button variant="outline" className="px-8 py-4">
              Cargar más
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
