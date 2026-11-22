import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { HeroSearchComponent } from '../components/hero';
import { NavbarComponent } from '../components/layout';
import { SeoService } from '../core';

@Component({
  selector: 'app-home-page',
  imports: [NavbarComponent, HeroSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar [animateLogo]="true" />
      <main id="homepage" tabindex="-1" class="flex flex-1 flex-col">
        <app-hero-search />
      </main>
    </div>
  `,
})
export class HomePageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateHomeMeta();
  }
}
