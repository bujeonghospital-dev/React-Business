"use client";
import { useEffect, useRef, useState } from "react";

interface VideoProps {
  setIsLoading?: (val: boolean) => void; // optional เผื่อบางหน้ายังไม่ได้ส่งมา
}

export default function Video({ setIsLoading }: VideoProps) {
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // เล่น/หยุดตามการมองเห็น
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (ready && setIsLoading) setIsLoading(false);
  }, [ready, setIsLoading]);

  return (
    <section
      id="main-banner"
      className="Video-video mt-5"
      aria-label="Company Video video">
      <video
        ref={videoRef}
        className="bg-media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/video/fixed-banner-poster.jpg"
        onLoadedData={() => setReady(true)}
        onPlay={() => setReady(true)}
        onError={() => setReady(true)}
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture>
        <source src="/images/video/tpp-thanakon.webm" type="video/webm" />
        <source src="/images/video/tpp-thanakon.mp4" type="video/mp4" />
      </video>

      <img
        className="bg-fallback"
        src="/images/video/fixed-banner-poster.jpg"
        alt=""
      />
      <div className="relative z-[1] w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 text-white"></div>
    </section>
  );
}
