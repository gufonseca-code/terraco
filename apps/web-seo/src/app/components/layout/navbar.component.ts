import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
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
      <div class="relative mx-auto max-w-7xl">
        <div
          [class]="
            mobileMenuOpen()
              ? 'terraco-m3-topbar terraco-m3-topbar--open pointer-events-auto relative z-30 flex min-h-[58px] items-center justify-between gap-3 border border-brand/35 bg-elevated/95 px-3.5 py-1.5 shadow-floating backdrop-blur-md sm:px-5'
              : 'terraco-m3-topbar pointer-events-auto relative z-30 flex min-h-[58px] items-center justify-between gap-3 border border-border-subtle bg-elevated/95 px-3.5 py-1.5 shadow-card backdrop-blur-md sm:px-5'
          "
        >
          <a href="#homepage" class="skip-link">Pular para o conteúdo</a>
          <app-terraco-logo [animate]="animateLogo()" />
          <app-navbar-links
            (mobileOpenChange)="mobileMenuOpen.set($event)"
            class="flex flex-1 items-center justify-end"
          />
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly animateLogo = input<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
}
