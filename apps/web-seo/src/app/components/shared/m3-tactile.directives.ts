import { Directive, computed, input } from '@angular/core';

export type M3ChipTone = 'light' | 'canvas' | 'dark' | 'brand' | 'nav';
export type M3ButtonVariant = 'primary' | 'tonal' | 'outline' | 'icon';

const CHIP_TONE_CLASSES: Record<
  M3ChipTone,
  { readonly active: string; readonly inactive: string }
> = {
  light: {
    active:
      'border border-transparent bg-[#1C1B19] text-[#FAF8F4] font-medium shadow-chip',
    inactive:
      'border border-transparent bg-[#F3EFE6] text-[#1C1B19] font-normal hover:bg-[#EAE3D5]',
  },
  canvas: {
    active:
      'border border-transparent bg-[#1C1B19] text-[#FAF8F4] font-medium shadow-chip',
    inactive:
      'border border-transparent bg-canvas text-[#1C1B19] font-normal hover:bg-elevated',
  },
  dark: {
    active:
      'border border-transparent bg-[#F3EFE6] text-[#1C1B19] font-semibold shadow-chip',
    inactive:
      'border border-transparent bg-white/[0.08] text-[#FAF8F4]/85 font-normal hover:bg-white/[0.14] hover:text-[#FAF8F4]',
  },
  brand: {
    active:
      'border border-brand/35 bg-[#E5F2EC] text-[#1F6F50] font-medium',
    inactive:
      'border border-border-subtle bg-surface/80 text-ink font-medium hover:border-border-strong hover:bg-surface',
  },
  nav: {
    active:
      'bg-surface font-medium text-ink shadow-chip',
    inactive:
      'bg-transparent font-normal text-ink-muted hover:bg-surface/60 hover:text-ink',
  },
};

/**
 * Reusable Material 3 Expressive (M3E) selection/filter chip directive.
 * Applies pill-to-squircle shape morphing, spring scale feedback, and AA contrast tones.
 */
@Directive({
  selector: '[appM3Chip]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class M3ChipDirective {
  readonly active = input<boolean>(false);
  readonly tone = input<M3ChipTone>('light');

  protected readonly hostClasses = computed(() => {
    const palette = CHIP_TONE_CLASSES[this.tone()];
    const stateClasses = this.active()
      ? `terraco-m3-chip--active ${palette.active}`
      : palette.inactive;
    return `terraco-m3-chip cursor-pointer ${stateClasses}`;
  });
}

const BUTTON_VARIANT_CLASSES: Record<M3ButtonVariant, string> = {
  primary:
    'terraco-btn cursor-pointer bg-action text-white font-medium hover:bg-action-hover',
  tonal:
    'terraco-m3-tonal-btn cursor-pointer bg-[#F3EFE6] text-[#1C1B19] font-medium hover:bg-[#EAE3D5]',
  outline:
    'terraco-m3-tonal-btn cursor-pointer border border-border-strong/70 bg-surface/80 text-ink font-medium hover:bg-surface',
  icon: 'terraco-m3-icon-btn cursor-pointer',
};

/**
 * Reusable Material 3 Expressive (M3E) action button directive.
 * Centralizes primary Terracota, tonal, outline, and icon button tactile physics.
 */
@Directive({
  selector: '[appM3Button]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class M3ButtonDirective {
  readonly variant = input<M3ButtonVariant>('primary');

  protected readonly hostClasses = computed(
    () => BUTTON_VARIANT_CLASSES[this.variant()]
  );
}
