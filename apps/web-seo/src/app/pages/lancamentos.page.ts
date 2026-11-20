import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { LaunchExplorerComponent } from '../components/launches';
import { FooterComponent, NavbarComponent } from '../components/layout';
import { SeoService } from '../core';

@Component({
  selector: 'app-lancamentos-page',
  imports: [NavbarComponent, LaunchExplorerComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh flex-col bg-canvas">
      <app-navbar />
      <main id="homepage" tabindex="-1" class="flex min-h-dvh flex-1 flex-col">
        <app-launch-explorer />
      </main>
      <app-footer />
    </div>
  `,
})
export class LancamentosPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateLancamentosMeta();
  }
}
