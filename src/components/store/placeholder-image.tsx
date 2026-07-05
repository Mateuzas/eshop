import { cn } from "@/lib/utils";

/**
 * Neutral stand-in for campaign/product photography — no brand imagery
 * exists yet. Swap the parent's <Image> in once real assets land; the
 * aspect-ratio wrapper and `absolute inset-0` contract stay the same so
 * callers won't need to change.
 */
export function PlaceholderImage({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br from-muted via-muted/60 to-muted/30",
        className
      )}
    >
      {label && (
        <span className="kicker text-muted-foreground/40">{label}</span>
      )}
    </div>
  );
}
