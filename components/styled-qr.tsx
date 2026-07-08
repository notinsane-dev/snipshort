"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import QRCodeStyling, { type Options } from "qr-code-styling";
import { cn } from "@/lib/utils";

function buildOptions(data: string, size: number, logoSrc: string): Partial<Options> {
  const image =
    typeof window === "undefined"
      ? logoSrc
      : new URL(logoSrc, window.location.origin).href;

  return {
    width: size,
    height: size,
    type: "svg",
    data,
    margin: 8,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { type: "square", color: "#f7eeda" },
    cornersSquareOptions: { type: "dot", color: "#f7eeda" },
    cornersDotOptions: { type: "square", color: "#f7eeda" },
    backgroundOptions: { color: "#2e2015" },
    image,
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 6,
      imageSize: 0.36,
      hideBackgroundDots: true,
    },
  };
}

export interface StyledQrHandle {
  download: (filename?: string) => void;
}

interface StyledQrProps {
  data: string;
  logoSrc: string;
  size?: number;
  className?: string;
  /** Show the four corner brackets around the code (viewfinder style). */
  framed?: boolean;
}

function ViewfinderFrame() {
  const corner =
    "absolute w-5 h-5 border-brand/45 pointer-events-none";
  return (
    <>
      <span className={cn(corner, "top-1 left-1 border-t-2 border-l-2 rounded-tl-md")} />
      <span className={cn(corner, "top-1 right-1 border-t-2 border-r-2 rounded-tr-md")} />
      <span className={cn(corner, "bottom-1 left-1 border-b-2 border-l-2 rounded-bl-md")} />
      <span className={cn(corner, "bottom-1 right-1 border-b-2 border-r-2 rounded-br-md")} />
    </>
  );
}

export const StyledQr = forwardRef<StyledQrHandle, StyledQrProps>(function StyledQr(
  { data, logoSrc, size = 200, className, framed = true },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const options = buildOptions(data, size, logoSrc);
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options);
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    } else {
      qrRef.current.update(options);
    }
  }, [data, size, logoSrc]);

  useImperativeHandle(
    ref,
    () => ({
      download(filename = "qr-code") {
        qrRef.current?.download({ name: filename, extension: "png" });
      },
    }),
    []
  );

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl bg-[#2e2015] p-3",
        className
      )}
    >
      {framed && <ViewfinderFrame />}
      <div
        ref={containerRef}
        className="relative z-[1] [&_svg]:block"
        style={{ width: size, height: size }}
      />
    </div>
  );
});
