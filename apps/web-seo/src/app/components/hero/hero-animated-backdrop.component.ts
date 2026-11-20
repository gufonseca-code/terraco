import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-hero-animated-backdrop',
  host: {
    class: 'block h-full w-full',
  },
  template: `
    <video
      #videoRef
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabindex="-1"
      class="h-full w-full object-cover object-left-top"
    >
      <source src="/videos/hero-terraco-bg.webm" type="video/webm" />
      <source src="/videos/hero-terraco-bg.mp4" type="video/mp4" />
    </video>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroAnimatedBackdropComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoRef');

  constructor() {
    afterNextRender(() => {
      const video = this.videoRef()?.nativeElement;
      if (!video) {
        return;
      }

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      let isInViewport = true;

      const syncPlayback = () => {
        if (motionQuery.matches || document.hidden || !isInViewport) {
          video.pause();
          return;
        }

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Navegador bloqueou autoplay (ex.: modo economia de bateria).
          });
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          isInViewport = entries[0]?.isIntersecting ?? true;
          syncPlayback();
        },
        { threshold: 0.05 }
      );

      observer.observe(video);
      document.addEventListener('visibilitychange', syncPlayback);
      motionQuery.addEventListener('change', syncPlayback);
      syncPlayback();

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', syncPlayback);
        motionQuery.removeEventListener('change', syncPlayback);
      });
    });
  }
}
