import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarLinksComponent } from './navbar-links.component';
import { TerracoLogoComponent } from './terraco-logo.component';

@Component({
  selector: 'app-navbar',
  imports: [TerracoLogoComponent, NavbarLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      data-testid="site-header"
      class="pointer-events-none sticky top-0 z-30 px-4 pt-2 sm:px-6 sm:pt-3"
    >
      <div
        class="pointer-events-auto relative mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-pill border border-border-subtle bg-elevated/95 px-5 py-1 shadow-card backdrop-blur-md sm:px-7 sm:py-1.5"
      >
        <a href="#homepage" class="skip-link">Pular para o conteúdo</a>
        <app-terraco-logo />
        <app-navbar-links />
      </div>
    </header>
  `,
})
export class NavbarComponent {}
