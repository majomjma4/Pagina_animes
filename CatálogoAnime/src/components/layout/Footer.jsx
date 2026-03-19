export function Footer() {
  return (
    <footer className="mt-16 rounded-t-[2rem] bg-surface-container-low py-12">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 px-6 text-sm md:flex-row">
        <div className="text-on-surface-variant">© 2024 CinemaCurator. Todos los derechos reservados.</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">Política de Privacidad</a>
          <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">Términos</a>
          <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">Contacto</a>
          <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">API</a>
        </div>
      </div>
    </footer>
  );
}
