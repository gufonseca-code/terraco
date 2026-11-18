import Link from "next/link";

interface TerracoLogoProps {
  inverted?: boolean;
  showSteps?: boolean;
}

export function TerracoLogo({
  inverted = false,
  showSteps = true,
}: TerracoLogoProps) {
  const textColor = inverted ? "text-ink-inverse" : "text-ink";
  const stepColor = inverted ? "text-accent" : "text-ink";

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 group focus:outline-none"
      aria-label="Terraço — Página inicial"
    >
      {showSteps && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="none"
          className={`h-7 w-7 transition-transform duration-200 group-hover:-translate-y-0.5 ${stepColor}`}
          aria-hidden="true"
        >
          <rect x="30" y="13" width="26" height="9" rx="2.5" fill="currentColor" />
          <rect x="19" y="27.5" width="37" height="9" rx="2.5" fill="currentColor" />
          <rect x="8" y="42" width="48" height="9" rx="2.5" fill="currentColor" />
        </svg>
      )}
      <span
        className={`font-display text-2xl font-bold tracking-tight leading-none ${textColor}`}
      >
        Terraço
      </span>
    </Link>
  );
}
