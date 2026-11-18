import Link from "next/link";

interface TerracoLogoProps {
  inverted?: boolean;
  showSteps?: boolean;
}

const WORDMARK_LETTERS = ["T", "e", "r", "r", "a", "ç", "o"];

export function TerracoLogo({
  inverted = false,
  showSteps = true,
}: TerracoLogoProps) {
  const textColor = inverted ? "text-ink-inverse" : "text-ink";
  const stepColor = inverted ? "text-accent" : "text-ink";

  return (
    <Link
      href="/"
      className="terraco-btn inline-flex items-center gap-1 rounded-sm py-1 shrink-0"
      aria-label="Terraço — Página inicial"
    >
      {showSteps && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="none"
          className={`h-7 w-7 ${stepColor}`}
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
        <span className="sr-only">Terraço</span>
        <span aria-hidden="true" className="inline-flex">
          {WORDMARK_LETTERS.map((letter, index) => (
            <span
              key={letter + index}
              className="animate-letter-jump"
              style={{ animationDelay: `${120 + index * 55}ms` }}
            >
              {letter}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
