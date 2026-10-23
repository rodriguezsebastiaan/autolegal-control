import { DemoShell } from "@/components/demo-shell";
import { requireLocalDemo } from "@/lib/demo-access";

export const dynamic = "force-dynamic";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  requireLocalDemo();
  return <DemoShell>{children}</DemoShell>;
}
