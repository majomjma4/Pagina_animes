import { Button } from "./Button";

export function EmptyState({ title, message, cta, onAction }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-10 text-center">
      <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
      <p className="mt-2 text-on-surface-variant">{message}</p>
      <Button className="mt-6 px-6 py-3" onClick={onAction}>
        {cta}
      </Button>
    </div>
  );
}
