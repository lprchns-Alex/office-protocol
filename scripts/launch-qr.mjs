import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
const outputs = new URL("../../outputs/", import.meta.url);
await mkdir(outputs, { recursive: true });
await QRCode.toFile(
  new URL("office-protocol-qr.png", outputs).pathname,
  "exp://192.168.0.5:8081",
  { width: 320, margin: 3, color: { dark: "#10120E", light: "#C7FF00" } },
);
console.log("Expo Go QR generated");
