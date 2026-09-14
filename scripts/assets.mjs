import sharp from "sharp";
import { readFile } from "node:fs/promises";
const svg = await readFile(
  new URL("../assets/protocol-icon.svg", import.meta.url),
);
await sharp(svg)
  .png()
  .toFile(new URL("../assets/icon.png", import.meta.url).pathname);
await sharp(svg)
  .resize(64, 64)
  .png()
  .toFile(new URL("../assets/favicon.png", import.meta.url).pathname);
await sharp(svg)
  .png()
  .toFile(
    new URL("../assets/android-icon-foreground.png", import.meta.url).pathname,
  );
console.log("App icon and favicon generated from protocol-icon.svg");
