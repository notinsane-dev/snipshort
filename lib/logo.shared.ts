export const LOGO_FILENAME = "snipshort.webp";
export const LOGO_FILE = `/${LOGO_FILENAME}`;

export function buildLogoSrc(version: string): string {
  return `${LOGO_FILE}?v=${version}`;
}
