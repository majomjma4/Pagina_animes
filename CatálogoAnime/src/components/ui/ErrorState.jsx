import { Button } from "./Button";

export function ErrorState({ title, message, cta, onRetry }) {
  return (
    <div className="rounded-lg bg-error-container/30 p-10 text-center">
      <h2 className="text-2xl font-bold text-on-error-container">{title}</h2>
      <p className="mt-2 text-on-error-container/80">{message}</p>
      <Button className="mt-6 px-6 py-3" onClick={onRetry}>
        {cta}
      </Button>
    </div>
  );
}
