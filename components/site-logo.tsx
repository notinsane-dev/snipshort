import Link from "next/link";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO = "/snipshort.webp";

interface SiteLogoProps {
  /** Pass getLogoSrc() from a Server Component to bust image cache after logo swaps. */
  src?: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  href?: string;
  size?: number;
}

export function SiteLogo({
  src = DEFAULT_LOGO,
  className,
  iconClassName,
  textClassName,
  showText = true,
  href,
  size = 22,
}: SiteLogoProps) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="SnipShort"
        width={size}
        height={size}
        className={cn("shrink-0 object-contain", iconClassName)}
      />
      {showText && (
        <span className={cn("font-bold tracking-tighter", textClassName)}>
          SnipShort
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-1.5", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
