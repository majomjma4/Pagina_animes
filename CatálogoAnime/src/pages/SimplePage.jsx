export function SimplePage({ title, description }) {
  return (
    <section className="rounded-lg bg-surface-container-low p-10">
      <h1 className="font-headline text-3xl font-bold text-on-surface">{title}</h1>
      <p className="mt-2 text-on-surface-variant">{description}</p>
    </section>
  );
}
