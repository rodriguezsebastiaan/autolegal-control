import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AUTOLEGAL CONTROL · DEMO", template: "%s | AUTOLEGAL DEMO" },
  description: "Demostración visual local de AUTOLEGAL CONTROL con datos ficticios.",
  robots: { index: false, follow: false },
};

export default function DemoRootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es-CO"><body>{children}</body></html>;
}
