import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  type AnimationCallbackEvent,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

const DESKTOP_ZOOM_SCALE = 2.2;
const MIN_ZOOM_SCALE = 1;
const MAX_ZOOM_SCALE = 4;
const EXPAND_DURATION_MS = 320;
const COLLAPSE_DURATION_MS = 260;

@Component({
  selector: 'app-image-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Visualização ampliada: ' + (title() || alt())"
      data-testid="image-lightbox"
      animate.enter="terraco-lightbox-backdrop-enter"
      animate.leave="terraco-lightbox-backdrop-leave"
      (click)="onBackdropClick($event)"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-xs sm:p-8"
    >
      <button
        #closeBtn
        type="button"
        data-testid="image-lightbox-close"
        (click)="requestClose()"
        aria-label="Fechar visualização ampliada"
        class="terraco-btn fixed top-4 right-4 z-20 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-pill border border-ink-inverse/20 bg-ink/70 px-4 text-sm font-medium text-ink-inverse backdrop-blur-sm hover:bg-ink/90 sm:top-6 sm:right-6 cursor-pointer"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
        <span>Fechar</span>
      </button>

      <div
        #stageRef
        data-testid="image-lightbox-stage"
        (animate.enter)="onStageEnter($event)"
        (animate.leave)="onStageLeave($event)"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
        (touchcancel)="onTouchEnd($event)"
        (pointerdown)="onPointerDown($event)"
        (click)="onImageClick($event)"
        [class.cursor-zoom-in]="!isZoomed()"
        [class.cursor-zoom-out]="isZoomed()"
        [class.transition-transform]="!isGesturing()"
        [class.duration-200]="!isGesturing()"
        [style.transform]="stageTransform()"
        [style.transform-origin]="transformOrigin()"
        class="relative flex max-h-[88dvh] max-w-[92vw] touch-none select-none items-center justify-center overflow-hidden rounded-md shadow-floating will-change-transform"
      >
        <img
          #fullImg
          data-testid="image-lightbox-img"
          [src]="src()"
          [alt]="alt()"
          [attr.data-zoomed]="isZoomed() ? 'true' : 'false'"
          [attr.data-zoom-scale]="zoomScale().toFixed(2)"
          draggable="false"
          decoding="async"
          class="block max-h-[88dvh] max-w-[92vw] rounded-md object-contain"
        />
      </div>
    </div>
  `,
})
export class ImageLightboxComponent {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly title = input<string>('');
  readonly originElement = input<HTMLElement | null>(null);

  readonly closed = output<void>();

  private readonly closeBtn =
    viewChild<ElementRef<HTMLButtonElement>>('closeBtn');
  private readonly stageRef = viewChild<ElementRef<HTMLDivElement>>('stageRef');

  readonly zoomScale = signal<number>(MIN_ZOOM_SCALE);
  readonly panX = signal<number>(0);
  readonly panY = signal<number>(0);
  readonly transformOrigin = signal<string>('50% 50%');
  readonly isGesturing = signal<boolean>(false);

  readonly isZoomed = computed(() => this.zoomScale() > 1.02);
  readonly stageTransform = computed(
    () =>
      `translate3d(${this.panX()}px, ${this.panY()}px, 0) scale(${this.zoomScale()})`
  );

  private lastPointerType = 'mouse';
  private pinchStartDistance = 0;
  private pinchStartScale = MIN_ZOOM_SCALE;
  private pinchStartMidX = 0;
  private pinchStartMidY = 0;
  private pinchStartPanX = 0;
  private pinchStartPanY = 0;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartPanX = 0;
  private dragStartPanY = 0;
  private isDragging = false;
  private suppressNextClick = false;
  private previousBodyOverflow = '';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const body = this.document.body;
      this.previousBodyOverflow = body.style.overflow;
      body.style.overflow = 'hidden';

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.requestClose();
        }
      };

      this.document.addEventListener('keydown', onKeyDown);

      this.destroyRef.onDestroy(() => {
        this.document.removeEventListener('keydown', onKeyDown);
        body.style.overflow = this.previousBodyOverflow;
      });

      afterNextRender(() => {
        this.closeBtn()?.nativeElement.focus();
      });
    }
  }

  requestClose(): void {
    this.resetZoom();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  onPointerDown(event: PointerEvent): void {
    this.lastPointerType = event.pointerType || 'mouse';
  }

  onImageClick(event: MouseEvent): void {
    event.stopPropagation();

    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }

    // Touch devices use two-finger pinch to zoom; desktop uses click to zoom in/out.
    if (this.lastPointerType === 'touch') {
      return;
    }

    if (this.isZoomed()) {
      this.resetZoom();
      return;
    }

    const stage = this.stageRef()?.nativeElement;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const originX = ((event.clientX - rect.left) / rect.width) * 100;
        const originY = ((event.clientY - rect.top) / rect.height) * 100;
        const clampedX = Math.min(100, Math.max(0, originX));
        const clampedY = Math.min(100, Math.max(0, originY));
        this.transformOrigin.set(`${clampedX.toFixed(1)}% ${clampedY.toFixed(1)}%`);
      }
    }

    this.panX.set(0);
    this.panY.set(0);
    this.zoomScale.set(DESKTOP_ZOOM_SCALE);
  }

  onTouchStart(event: TouchEvent): void {
    this.lastPointerType = 'touch';

    if (event.touches.length === 2) {
      event.preventDefault();
      this.isGesturing.set(true);
      this.isDragging = false;
      this.suppressNextClick = true;

      const [t1, t2] = [event.touches[0], event.touches[1]];
      this.pinchStartDistance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY
      );
      this.pinchStartScale = this.zoomScale();
      this.pinchStartMidX = (t1.clientX + t2.clientX) / 2;
      this.pinchStartMidY = (t1.clientY + t2.clientY) / 2;
      this.pinchStartPanX = this.panX();
      this.pinchStartPanY = this.panY();
      this.transformOrigin.set('50% 50%');
    } else if (event.touches.length === 1 && this.isZoomed()) {
      event.preventDefault();
      this.isGesturing.set(true);
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartY = event.touches[0].clientY;
      this.dragStartPanX = this.panX();
      this.dragStartPanY = this.panY();
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2 && this.pinchStartDistance > 0) {
      event.preventDefault();
      const [t1, t2] = [event.touches[0], event.touches[1]];
      const currentDistance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY
      );
      const nextScale = Math.min(
        MAX_ZOOM_SCALE,
        Math.max(
          MIN_ZOOM_SCALE,
          this.pinchStartScale * (currentDistance / this.pinchStartDistance)
        )
      );

      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;
      const nextPanX = this.pinchStartPanX + (currentMidX - this.pinchStartMidX);
      const nextPanY = this.pinchStartPanY + (currentMidY - this.pinchStartMidY);

      this.zoomScale.set(nextScale);
      const clamped = this.clampPan(nextPanX, nextPanY, nextScale);
      this.panX.set(clamped.x);
      this.panY.set(clamped.y);
      return;
    }

    if (event.touches.length === 1 && this.isDragging && this.isZoomed()) {
      event.preventDefault();
      const dx = event.touches[0].clientX - this.dragStartX;
      const dy = event.touches[0].clientY - this.dragStartY;
      const clamped = this.clampPan(
        this.dragStartPanX + dx,
        this.dragStartPanY + dy,
        this.zoomScale()
      );
      this.panX.set(clamped.x);
      this.panY.set(clamped.y);
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.pinchStartDistance = 0;
    }

    if (event.touches.length === 1 && this.isZoomed()) {
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartY = event.touches[0].clientY;
      this.dragStartPanX = this.panX();
      this.dragStartPanY = this.panY();
      return;
    }

    if (event.touches.length === 0) {
      this.isDragging = false;
      this.isGesturing.set(false);
      if (this.zoomScale() < 1.05) {
        this.resetZoom();
      }
    }
  }

  onStageEnter(event: AnimationCallbackEvent): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.prefersReducedMotion() ||
      typeof event.target.animate !== 'function'
    ) {
      event.animationComplete();
      return;
    }

    const el = event.target as HTMLElement;
    const fromTransform = this.computeOriginTransform(el);

    const animation = el.animate(
      [
        {
          transform: fromTransform,
          opacity: 0.65,
          borderRadius: '20px',
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          opacity: 1,
          borderRadius: '16px',
        },
      ],
      {
        duration: EXPAND_DURATION_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    );

    const complete = () => event.animationComplete();
    animation.addEventListener('finish', complete, { once: true });
    animation.addEventListener('cancel', complete, { once: true });
  }

  onStageLeave(event: AnimationCallbackEvent): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.prefersReducedMotion() ||
      typeof event.target.animate !== 'function'
    ) {
      event.animationComplete();
      return;
    }

    const el = event.target as HTMLElement;
    const toTransform = this.computeOriginTransform(el);

    const animation = el.animate(
      [
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          opacity: 1,
          borderRadius: '16px',
        },
        {
          transform: toTransform,
          opacity: 0.35,
          borderRadius: '20px',
        },
      ],
      {
        duration: COLLAPSE_DURATION_MS,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards',
      }
    );

    const complete = () => event.animationComplete();
    animation.addEventListener('finish', complete, { once: true });
    animation.addEventListener('cancel', complete, { once: true });
  }

  private resetZoom(): void {
    this.zoomScale.set(MIN_ZOOM_SCALE);
    this.panX.set(0);
    this.panY.set(0);
    this.transformOrigin.set('50% 50%');
  }

  private clampPan(
    x: number,
    y: number,
    scale: number
  ): { x: number; y: number } {
    if (scale <= 1) {
      return { x: 0, y: 0 };
    }

    const stage = this.stageRef()?.nativeElement;
    if (!stage) {
      return { x, y };
    }

    const maxX = ((stage.offsetWidth * (scale - 1)) / 2) * 1.1;
    const maxY = ((stage.offsetHeight * (scale - 1)) / 2) * 1.1;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  private computeOriginTransform(targetEl: HTMLElement): string {
    const originEl = this.originElement();
    if (!originEl) {
      return 'translate3d(0, 12px, 0) scale(0.9)';
    }

    const originRect = originEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    if (
      originRect.width <= 0 ||
      originRect.height <= 0 ||
      targetRect.width <= 0 ||
      targetRect.height <= 0
    ) {
      return 'translate3d(0, 12px, 0) scale(0.9)';
    }

    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    const dx = originCenterX - targetCenterX;
    const dy = originCenterY - targetCenterY;
    const scale = Math.min(
      originRect.width / targetRect.width,
      originRect.height / targetRect.height
    );
    const clampedScale = Math.min(0.95, Math.max(0.2, scale));

    return `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${clampedScale.toFixed(3)})`;
  }

  private prefersReducedMotion(): boolean {
    const view = this.document.defaultView;
    return Boolean(
      view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
  }
}
