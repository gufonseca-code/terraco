import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Terracota backdrop placeholder (arte SVG removida para teste de performance).
 * Mantém a mesma geometria de host (absolute inset-0) para não alterar layout.
 */
@Component({
  selector: 'app-footer-cobogo-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none absolute inset-0 block overflow-hidden select-none',
    'aria-hidden': 'true',
  },
  template: `<div class="block h-full w-full bg-[#C84E22]" aria-hidden="true"></div>`,
})
export class FooterCobogoBackdropComponent {}
