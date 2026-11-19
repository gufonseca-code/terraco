import { useId } from "react";
import Link from "next/link";

export interface TerracoStairsMarkProps {
  className?: string;
  interactive?: boolean;
  active?: boolean;
  label?: string;
}

export interface TerracoLogoProps {
  inverted?: boolean;
  showSteps?: boolean;
  animate?: boolean;
  className?: string;
}

const STAIR_STEPS = [
  { id: 1, x: 30, y: 13, width: 26 },
  { id: 2, x: 19, y: 27.5, width: 37 },
  { id: 3, x: 8, y: 42, width: 48 },
  { id: 4, x: 8, y: 56.5, width: 48 },
] as const;

const WORDMARK_LETTERS = ["T", "e", "r", "r", "a", "ç", "o"];

/** Reusable animated ascending-staircase mark for the Terraço brand. */
export function TerracoStairsMark({
  className = "h-7 w-7",
  interactive = false,
  active = false,
  label,
}: TerracoStairsMarkProps) {
  const clipId = useId();
  const classes = [
    interactive || active ? "terraco-stairs" : "",
    active ? "terraco-stairs--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={classes}
      data-stairs-active={active ? "true" : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="5" width="64" height="54" rx="2" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {STAIR_STEPS.map((step) => (
          <rect
            key={step.id}
            x={step.x}
            y={step.y}
            width={step.width}
            height={9}
            rx={2.5}
            fill="currentColor"
            className={`terraco-stairs-step terraco-stairs-step--${step.id}`}
          />
        ))}
      </g>
    </svg>
  );
}

export function TerracoLogo({
  inverted = false,
  showSteps = true,
  animate = true,
  className = "",
}: TerracoLogoProps) {
  const textColor = inverted ? "text-ink-inverse" : "text-ink";
  const stepColor = inverted ? "text-accent" : "text-ink";
  const linkClasses = [
    "terraco-logo terraco-stairs terraco-btn inline-flex items-center gap-1.5 rounded-sm py-1 shrink-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href="/"
      className={linkClasses}
      aria-label="Terraço, página inicial"
    >
      {showSteps && <TerracoStairsMark className={`h-7 w-7 ${stepColor}`} />}
      <span
        className={`font-display text-2xl font-bold tracking-tight leading-[1.15] ${textColor}`}
      >
        {animate ? (
          <>
            <span className="sr-only">Terraço</span>
            <span aria-hidden="true" className="inline-flex items-baseline">
              {WORDMARK_LETTERS.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="animate-letter-jump"
                  style={{ animationDelay: `${80 + index * 100}ms` }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </>
        ) : (
          "Terraço"
        )}
      </span>
    </Link>
  );
}
