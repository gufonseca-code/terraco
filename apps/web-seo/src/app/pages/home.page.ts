import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { GuidedDiscoveryComponent } from '../components/hero/guided-discovery.component';
import { HeroSearchComponent } from '../components/hero/hero-search.component';
import { TrustConciergeComponent } from '../components/hero/trust-concierge.component';
import { FeaturedLaunchesComponent } from '../components/launches/featured-launches.component';
import { FooterComponent, NavbarComponent } from '../components/layout';
import { SeoService } from '../core';

@Component({
  selector: 'app-home-page',
  imports: [
    NavbarComponent,
    HeroSearchComponent,
    GuidedDiscoveryComponent,
    FeaturedLaunchesComponent,
    TrustConciergeComponent,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar [animateLogo]="true" />
      <main id="homepage" tabindex="-1" class="flex flex-1 flex-col">
        <div class="flex min-h-[calc(100dvh-4.5rem)] flex-col">
          <app-hero-search />
        </div>
        <app-featured-launches />
        @defer (on viewport; hydrate on viewport) {
          <app-guided-discovery />
        } @placeholder {
          <section
            aria-hidden="true"
            class="min-h-[420px] border-t border-border-subtle bg-canvas py-16 sm:py-20 lg:py-24"
          ></section>
        }
        @defer (on viewport; hydrate on viewport) {
          <app-trust-concierge />
        } @placeholder {
          <section
            aria-hidden="true"
            class="min-h-[440px] border-t border-border-subtle bg-surface/45 py-16 sm:py-20 lg:py-24"
          ></section>
        }
      </main>
      <app-footer />
    </div>
  `,
})
export class HomePageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateHomeMeta();
  }
}
