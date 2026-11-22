import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  LaunchDetailSkeletonComponent,
  PrimeViewLandingComponent,
} from '../components/launches';
import { FooterComponent, NavbarComponent } from '../components/layout';
import { LancamentosService, SeoService } from '../core';
import { NotFoundPageComponent } from './not-found.page';

@Component({
  selector: 'app-lancamento-detail-page',
  imports: [
    NavbarComponent,
    PrimeViewLandingComponent,
    LaunchDetailSkeletonComponent,
    FooterComponent,
    NotFoundPageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading() && !item()) {
      <div class="flex min-h-dvh flex-col bg-canvas">
        <app-navbar />
        <main id="homepage" tabindex="-1" class="flex min-h-dvh flex-1 flex-col">
          <app-launch-detail-skeleton />
        </main>
        <app-footer />
      </div>
    } @else if (item(); as currentItem) {
      <div class="flex min-h-dvh flex-col bg-canvas">
        <app-navbar />
        <main id="homepage" tabindex="-1" class="flex min-h-dvh flex-1 flex-col">
          <app-prime-view-landing [item]="currentItem" />
        </main>
        <app-footer />
      </div>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class LancamentoDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly lancamentosService = inject(LancamentosService);
  private readonly seoService = inject(SeoService);

  readonly isLoading = this.lancamentosService.isLoadingDetail;

  readonly slug = input<string>('');
  private readonly routeParamMap = toSignal(this.route.paramMap);

  readonly resolvedSlug = computed(() => {
    const fromInput = this.slug();
    if (fromInput) {
      return fromInput;
    }
    return (
      this.routeParamMap()?.get('slug') ??
      this.route.snapshot.paramMap.get('slug') ??
      ''
    );
  });

  readonly item = computed(() =>
    this.lancamentosService.getBySlug(this.resolvedSlug())
  );

  constructor() {
    effect(() => {
      const current = this.item();
      if (current) {
        this.seoService.updateLancamentoDetailMeta(current);
      } else {
        this.seoService.updateNotFoundMeta();
      }
    });
  }
}
