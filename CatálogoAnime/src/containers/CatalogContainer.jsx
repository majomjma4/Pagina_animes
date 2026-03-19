import { useEffect, useState } from "react";
import { getAnimeCatalog } from "../services/animeService";
import { CatalogPage } from "../pages/CatalogPage";

const filtersMock = {
  genres: ["Acción", "Fantasía", "Drama", "Sci-Fi"],
  years: ["Todos", "2024", "2023", "2022"],
  types: ["Todos", "Serie", "Película", "OVA"],
  statuses: ["Todos", "En emisión", "Finalizado"]
};

export const userMock = {
  name: "Valeria",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWhCPxdahrwix0v1oclhnSfSg7S-HvoE6OD7FFNLGDbvmpKYUeDKjUbW0Py-4eT8P7f9g9S-o3sUkdC4pv0QeZDHVB1pEnBZWrPWLooNkV08TUa6dIucEaCciLzH0R9isT9Zb3_3eGADwrVooaH9_eawo-Q4FRd8-StnUT8ZMVSu9TE49ZrLvwGZZWL1DyGv-tig2QhYH6EGDPZhM-dJWP3MceKjggJEXgUtMhC1RCLHa87FVu0XQMPvXqM5CMXQ6KgRGNyis0-LuS"
};

export function CatalogContainer() {
  const [state, setState] = useState({
    items: [],
    total: 0,
    loading: true,
    error: null
  });

  const loadCatalog = async ({ shouldFail = false } = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await getAnimeCatalog({ shouldFail });
      setState({ items: response.data, total: response.total, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  return (
    <CatalogPage
      items={state.items}
      total={state.total}
      loading={state.loading}
      error={state.error}
      onRetry={() => loadCatalog()}
      filters={filtersMock}
    />
  );
}
