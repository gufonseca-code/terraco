import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSvgPrototypeComponent } from './hero-svg-prototype.component';

@Component({
  selector: 'app-hero-illustration',
  imports: [HeroSvgPrototypeComponent],
  host: {
    class: 'contents',
  },
  template: `
    <div
      data-testid="hero-backdrop"
      class="terraco-reveal pointer-events-none absolute inset-y-0 right-0 w-[96%] overflow-hidden select-none sm:w-[82%] md:w-[54%] lg:w-[44vw] lg:max-w-[720px] xl:w-[45vw]"
    >
      <app-hero-svg-prototype className="h-full w-full" />
      <!-- Transição sutil na borda esquerda para fusão limpa com o fundo Creme Papel -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-canvas via-canvas/45 to-transparent sm:w-20 md:w-44 md:via-canvas/90 lg:w-14 lg:via-canvas/30"
      ></div>
      <!-- Fade vertical na base para dissolver a fachada no fundo Creme Papel antes da seção seguinte -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-canvas via-canvas/75 to-transparent sm:h-24 lg:h-28"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroIllustrationComponent {}
