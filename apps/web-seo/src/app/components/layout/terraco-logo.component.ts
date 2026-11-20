import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StairStep {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
}

const STAIR_STEPS: readonly StairStep[] = [
  { id: 1, x: 30, y: 13, width: 26 },
  { id: 2, x: 19, y: 27.5, width: 37 },
  { id: 3, x: 8, y: 42, width: 48 },
  { id: 4, x: 8, y: 56.5, width: 48 },
];

const WORDMARK_LETTERS: readonly string[] = ['T', 'e', 'r', 'r', 'a', 'ç', 'o'];

let nextId = 0;

/** Reusable animated ascending-staircase mark for the Terraço brand. */
@Component({
  selector: 'app-terraco-stairs-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      [attr.class]="svgClasses()"
      [attr.data-stairs-active]="active() ? 'true' : null"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() ?? null"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      <svg:defs>
        <svg:clipPath [attr.id]="clipId">
          <svg:rect x="0" y="5" width="64" height="54" rx="2" />
        </svg:clipPath>
      </svg:defs>
      <svg:g [attr.clip-path]="'url(#' + clipId + ')'">
        @for (step of stairSteps; track step.id) {
          <svg:rect
            [attr.x]="step.x"
            [attr.y]="step.y"
            [attr.width]="step.width"
            height="9"
            rx="2.5"
            fill="currentColor"
            [attr.class]="'terraco-stairs-step terraco-stairs-step--' + step.id"
          />
        }
      </svg:g>
    </svg>
  `,
})
export class TerracoStairsMarkComponent {
  readonly className = input<string>('h-7 w-7');
  readonly interactive = input<boolean>(false);
  readonly active = input<boolean>(false);
  readonly label = input<string | undefined>(undefined);

  readonly clipId = `terraco-stairs-clip-${nextId++}`;
  readonly stairSteps = STAIR_STEPS;

  readonly svgClasses = computed(() =>
    [
      this.interactive() || this.active() ? 'terraco-stairs' : '',
      this.active() ? 'terraco-stairs--active' : '',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ')
  );
}

@Component({
  selector: 'app-terraco-logo',
  imports: [RouterLink, TerracoStairsMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      routerLink="/"
      [class]="linkClasses()"
      aria-label="Terraço, página inicial"
    >
      @if (showSteps()) {
        <app-terraco-stairs-mark [className]="stepClasses()" />
      }
      <span [class]="wordmarkClasses()">
        @if (animate()) {
          <span class="sr-only">Terraço</span>
          <span aria-hidden="true" class="inline-flex items-baseline">
            @for (letter of wordmarkLetters; track $index) {
              <span
                class="animate-letter-jump"
                [style.animationDelay]="80 + $index * 100 + 'ms'"
              >{{ letter }}</span>
            }
          </span>
        } @else {
          Terraço
        }
      </span>
    </a>
  `,
})
export class TerracoLogoComponent {
  readonly inverted = input<boolean>(false);
  readonly showSteps = input<boolean>(true);
  readonly animate = input<boolean>(true);
  readonly className = input<string>('');

  readonly wordmarkLetters = WORDMARK_LETTERS;

  readonly textColor = computed(() =>
    this.inverted() ? 'text-ink-inverse' : 'text-ink'
  );

  readonly stepClasses = computed(
    () => `h-7 w-7 ${this.inverted() ? 'text-accent' : 'text-ink'}`
  );

  readonly linkClasses = computed(() =>
    [
      'terraco-logo terraco-stairs terraco-btn inline-flex items-center gap-1.5 rounded-sm py-0.5 shrink-0',
      this.className(),
    ]
      .filter(Boolean)
      .join(' ')
  );

  readonly wordmarkClasses = computed(
    () =>
      `font-display text-2xl font-bold tracking-tight leading-[1.15] ${this.textColor()}`
  );
}
