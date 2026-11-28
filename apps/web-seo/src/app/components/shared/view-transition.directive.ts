import { Directive, computed, input } from '@angular/core';

export type ViewTransitionKind =
  | 'launch-image'
  | 'launch-title'
  | 'bairro-title'
  | 'page-heading'
  | 'botanical-arch'
  | 'search-bar'
  | 'footer';

const STATIC_NAMES: Partial<Record<ViewTransitionKind, string>> = {
  'page-heading': 'terraco-page-heading',
  'botanical-arch': 'terraco-botanical-arch',
  'search-bar': 'terraco-search-bar',
  footer: 'terraco-footer',
};

/**
 * Reusable directive assigning unique `view-transition-name` tokens across
 * routes so Angular `withViewTransitions()` smoothly repositions shared
 * elements (cards, titles, headings, search bar, botanical arch, footer).
 */
@Directive({
  selector: '[appViewTransition]',
  host: {
    '[style.view-transition-name]': 'transitionName()',
  },
})
export class ViewTransitionDirective {
  readonly kind = input.required<ViewTransitionKind>({
    alias: 'appViewTransition',
  });
  readonly slug = input<string | null | undefined>(undefined, {
    alias: 'vtSlug',
  });

  protected readonly transitionName = computed(() => {
    const kind = this.kind();
    const staticName = STATIC_NAMES[kind];
    if (staticName) {
      return staticName;
    }
    const itemSlug = this.slug()?.trim();
    return itemSlug ? `${kind}-${itemSlug}` : null;
  });
}
