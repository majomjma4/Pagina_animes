const baseStyles =
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary/90",
  ghost: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
  outline: "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
  danger: "bg-error text-on-error hover:bg-error/90"
};

export function Button({
  as: Component = "button",
  className = "",
  variant = "primary",
  type = "button",
  children,
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? type : undefined}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
