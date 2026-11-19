"use client";

import { useEffect, useRef } from "react";

export function HeroAnimatedBackdrop() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    document.addEventListener("visibilitychange", syncPlayback);
    motionQuery.addEventListener("change", syncPlayback);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motionQuery.removeEventListener("change", syncPlayback);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      className="h-full w-full object-cover object-left-top"
    >
      <source src="/videos/hero-terraco-bg.webm" type="video/webm" />
      <source src="/videos/hero-terraco-bg.mp4" type="video/mp4" />
    </video>
  );
}
