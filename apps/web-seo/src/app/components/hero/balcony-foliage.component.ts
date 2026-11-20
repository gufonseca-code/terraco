import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * All balcony plants and pots that sit BEHIND the railings and front concrete slabs.
 */
@Component({
  selector: 'g[appBalconyFoliage]',
  templateUrl: './balcony-foliage.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalconyFoliageComponent {}
