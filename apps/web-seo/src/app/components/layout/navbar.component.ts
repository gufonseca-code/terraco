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
      [class]="
        mobileMenuOpen()
          ? 'sticky top-0 z-30 border-b border-border-subtle bg-canvas/95 backdrop-blur-md'
          : 'sticky top-0 z-30 border-b border-[rgba(28,27,25,0.08)] bg-canvas/90 backdrop-blur-md'
      "
    >
      <div
        class="relative mx-auto flex min-h-[58px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <a href="#homepage" class="skip-link">Pular para o conteúdo</a>
        <app-terraco-logo [animate]="animateLogo()" />
        <app-navbar-links
          (mobileOpenChange)="mobileMenuOpen.set($event)"
          class="flex flex-1 items-center justify-end"
        />
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly animateLogo = input<boolean>(false);
  readonly mobileMenuOpen = signal<boolean>(false);
}
