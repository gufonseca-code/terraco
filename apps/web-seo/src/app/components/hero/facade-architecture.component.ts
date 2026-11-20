import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Layer 1 (behind balcony foliage):
 * Canvas background, left sunlit walls, recessed inner back & side walls,
 * diagonal sunlight/shadow wedges on every floor, and all doors/shutters/windows.
 */
@Component({
  selector: 'g[appFacadeBackdrop]',
  templateUrl: './facade-backdrop.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacadeBackdropComponent {}

/**
 * Layer 2 (in front of balcony foliage):
 * All 3 balcony railings & balusters, center vertical structural pillar,
 * and all 4 concrete floor slabs with angled underside bevels and subtle shadow lines.
 */
@Component({
  selector: 'g[appFacadeForegroundStructure]',
  templateUrl: './facade-foreground-structure.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacadeForegroundStructureComponent {}
