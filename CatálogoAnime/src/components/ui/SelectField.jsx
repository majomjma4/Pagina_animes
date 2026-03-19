export function SelectField({ id, label, options = [] }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-xl bg-surface-container-lowest px-4 py-3 text-on-surface"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
