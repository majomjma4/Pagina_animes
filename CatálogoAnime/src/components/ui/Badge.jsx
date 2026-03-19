export function Badge({ className = "", children }) {
  return (
    <span
      className={`rounded-full bg-surface/80 px-3 py-1 text-xs font-bold text-on-surface ${className}`}
    >
      {children}
    </span>
  );
}
