type BadgeVariant = "neutral" | "blue" | "amber" | "green" | "red";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

/** A small rounded label used for status/priority indicators. */
export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
