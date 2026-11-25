import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Lightweight static Brand Motif signature (three botanical arches in
 * Urban Leaf Green, Terracota Solar, and Solar Yellow with sun and foliage).
 * Uses an external `.svg` template to preserve SVG namespace integrity in SSR.
 */
@Component({
  selector: 'app-botanical-arch-motif',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block shrink-0 select-none',
    'aria-hidden': 'true',
  },
  templateUrl: './botanical-arch-motif.component.svg',
})
export class BotanicalArchMotifComponent {}
