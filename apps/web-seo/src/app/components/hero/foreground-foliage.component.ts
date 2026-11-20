import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * All foreground foliage that renders IN FRONT OF railings and front concrete slabs:
 * - Upper-right & mid-right cascading pothos/ivy vines
 * - Bottom-right hero banana/strelitzia & fenestrated monstera cluster
 */
@Component({
  selector: 'g[appForegroundFoliage]',
  templateUrl: './foreground-foliage.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForegroundFoliageComponent {}
