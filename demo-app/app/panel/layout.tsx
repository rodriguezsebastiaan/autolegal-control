import { DemoShell } from "@/components/demo-shell";
import { DemoProvider } from "@/components/demo-store";
import { requireLocalDemo } from "@/lib/demo-access";

export const dynamic = "force-dynamic";

export default function EvaluationLayout({ children }: { children: React.ReactNode }) {
  requireLocalDemo();
  return <DemoProvider><DemoShell>{children}</DemoShell></DemoProvider>;
}
