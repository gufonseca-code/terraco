import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Full-bleed Risograph-style architectural SVG backdrop for the site footer.
 * Combines an 8-petal Brazilian floral cobogó tile grid in terracotta clay,
 * golden-hour backlit glow, overhanging Urban Leaf Green tropical branches,
 * and subtle soy-ink grain — using an external `.svg` template to preserve
 * SVG namespace integrity during Angular SSR/prerendering.
 */
@Component({
  selector: 'app-footer-cobogo-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none absolute inset-0 block overflow-hidden select-none',
    'aria-hidden': 'true',
  },
  templateUrl: './footer-cobogo-backdrop.component.svg',
})
export class FooterCobogoBackdropComponent {}
