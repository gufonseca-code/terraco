import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  FacadeBackdropComponent,
  FacadeForegroundStructureComponent,
} from './facade-architecture.component';
import { BalconyFoliageComponent } from './balcony-foliage.component';
import { ForegroundFoliageComponent } from './foreground-foliage.component';

@Component({
  selector: 'app-hero-svg-prototype',
  imports: [
    FacadeBackdropComponent,
    BalconyFoliageComponent,
    FacadeForegroundStructureComponent,
    ForegroundFoliageComponent,
  ],
  host: {
    class: 'block h-full w-full',
  },
  template: `
    <svg
      viewBox="0 0 720 1280"
      preserveAspectRatio="xMinYMin slice"
      aria-hidden="true"
      focusable="false"
      [attr.class]="className()"
    >
      <svg:g appFacadeBackdrop />
      <svg:g appBalconyFoliage />
      <svg:g appFacadeForegroundStructure />
      <svg:g appForegroundFoliage />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSvgPrototypeComponent {
  readonly className = input<string>('h-full w-full');
}
