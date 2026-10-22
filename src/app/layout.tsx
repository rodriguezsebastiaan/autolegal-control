import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AUTOLEGAL CONTROL", template: "%s | AUTOLEGAL CONTROL" },
  description: "Control empresarial de flota y vigencias documentales para Autolegal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
