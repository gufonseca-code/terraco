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

@Component({
  selector: 'app-navbar-links',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      data-testid="site-navbar"
      aria-label="Navegação principal"
      class="flex items-center"
    >
      <a
        routerLink="/lancamentos"
        [attr.aria-current]="isCurrent() ? 'page' : null"
        class="terraco-nav-link px-1 text-sm font-semibold leading-[1.35]"
      >
        Lançamentos
      </a>
    </nav>
  `,
})
export class NavbarLinksComponent {
  private readonly router = inject(Router);
  private readonly currentUrl = signal<string>(this.router.url);

  readonly isCurrent = computed(() =>
    this.currentUrl().startsWith('/lancamentos')
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
