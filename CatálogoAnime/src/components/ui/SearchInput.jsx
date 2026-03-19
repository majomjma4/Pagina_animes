export function SearchInput({ id, label, placeholder, icon = "search" }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <input
          id={id}
          className="w-full bg-transparent border-none focus:ring-0"
          type="search"
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
    </div>
  );
}
