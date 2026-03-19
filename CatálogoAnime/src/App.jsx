import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { CatalogContainer, userMock } from "./containers/CatalogContainer";
import { SimplePage } from "./pages/SimplePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout user={userMock} />}>
          <Route index element={<SimplePage title="Explorar" description="Descubre lo mejor del anime curado para ti." />} />
          <Route path="/series" element={<SimplePage title="Series" description="Explora series por género, año y popularidad." />} />
          <Route path="/peliculas" element={<SimplePage title="Películas" description="Películas destacadas y estrenos." />} />
          <Route path="/populares" element={<SimplePage title="Populares" description="Los títulos más vistos ahora mismo." />} />
          <Route path="/catalogo" element={<CatalogContainer />} />
          <Route path="/detalle/:id" element={<SimplePage title="Detalle" description="Vista de detalle del anime." />} />
          <Route path="/perfil" element={<SimplePage title="Perfil" description="Perfil del usuario y favoritos." />} />
          <Route path="*" element={<SimplePage title="404" description="Página no encontrada." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
