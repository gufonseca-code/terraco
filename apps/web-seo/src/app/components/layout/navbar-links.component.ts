import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { buildWhatsAppUrl } from '../../core';

@Component({
  selector: 'app-navbar-links',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      data-testid="site-navbar"
      aria-label="Navegação principal"
      class="flex items-center gap-2 sm:gap-3"
    >
      <a
        routerLink="/bairros/estoril"
        [attr.aria-current]="isBairrosCurrent() ? 'page' : null"
        class="terraco-link-underline hidden min-h-[40px] items-center px-2 text-sm font-normal leading-[1.35] text-ink-muted transition-colors duration-150 hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink sm:inline-flex"
      >
        Bairros
      </a>

      <a
        [href]="whatsappHref"
        target="_blank"
        rel="noopener noreferrer"
        class="terraco-link-underline hidden min-h-[40px] items-center px-2 text-sm font-normal leading-[1.35] text-ink-muted transition-colors duration-150 hover:text-ink md:inline-flex"
      >
        WhatsApp
      </a>

      <a
        routerLink="/lancamentos"
        [attr.aria-current]="isCurrent() ? 'page' : null"
        class="terraco-btn terraco-nav-link rounded-pill px-4 text-sm font-medium leading-[1.35]"
      >
        Lançamentos
      </a>
    </nav>
  `,
})
export class NavbarLinksComponent {
  private readonly router = inject(Router);
  private readonly currentUrl = signal<string>(this.router.url);

  readonly whatsappHref = buildWhatsAppUrl(
    'Oi! Gostaria de conversar sobre os lançamentos da Terraço em BH.'
  );

  readonly isCurrent = computed(() =>
    this.currentUrl().startsWith('/lancamentos')
  );

  readonly isBairrosCurrent = computed(() =>
    this.currentUrl().startsWith('/bairros')
  );

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }
}
