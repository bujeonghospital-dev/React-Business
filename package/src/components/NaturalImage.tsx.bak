"use client";

import Image from "next/image";
import clsx from "clsx";

type NaturalImageProps = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  bleed?: boolean;
};

export default function NaturalImage({
  src,
  width,
  height,
  alt = "",
  className,
  bleed = false,
}: NaturalImageProps) {
  return (
    <div className={clsx(bleed ? "w-screen" : "w-full")}>
      <div className={clsx("mx-auto", "max-w-[2048px]")}>
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          className={clsx("block w-full h-auto", className)}
          sizes={bleed ? "100vw" : "(min-width:1024px) 1024px, 100vw"}
          priority
        />
      </div>
    </div>
  );
}
