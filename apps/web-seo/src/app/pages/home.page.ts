import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  GuidedDiscoveryComponent,
  HeroSearchComponent,
} from '../components/hero';
import { FooterComponent, NavbarComponent } from '../components/layout';
import { SeoService } from '../core';

@Component({
  selector: 'app-home-page',
  imports: [
    NavbarComponent,
    HeroSearchComponent,
    GuidedDiscoveryComponent,
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
        <app-guided-discovery />
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
