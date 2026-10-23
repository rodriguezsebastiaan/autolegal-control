import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AUTOLEGAL CONTROL", template: "%s | AUTOLEGAL CONTROL" },
  description: "Panel local de evaluación funcional de AUTOLEGAL CONTROL.",
  robots: { index: false, follow: false },
};

export default function DemoRootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es-CO"><body>{children}</body></html>;
}
