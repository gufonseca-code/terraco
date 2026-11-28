import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Botanical arch motif placeholder (arte SVG removida para teste de performance).
 * Mantém o elemento vazio com h-full/w-full para preservar o espaço/layout
 * definido pelas classes externas (h-32 sm:h-36 lg:h-40).
 */
@Component({
  selector: 'app-botanical-arch-motif',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block shrink-0 select-none',
    'aria-hidden': 'true',
  },
  template: `<div class="block h-full w-full" aria-hidden="true"></div>`,
})
export class BotanicalArchMotifComponent {}
