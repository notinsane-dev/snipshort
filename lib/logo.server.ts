import "server-only";

import fs from "fs";
import path from "path";
import { LOGO_FILENAME, buildLogoSrc } from "./logo.shared";

/** Read logo file mtime so replacing the file busts caches automatically. */
export function getLogoSrc(): string {
  try {
    const stat = fs.statSync(
      path.join(process.cwd(), "public", LOGO_FILENAME)
    );
    return buildLogoSrc(String(Math.floor(stat.mtimeMs)));
  } catch {
    return buildLogoSrc("0");
  }
}
