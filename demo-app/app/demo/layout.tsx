import { requireLocalDemo } from "@/lib/demo-access";

export const dynamic = "force-dynamic";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  requireLocalDemo();
  return children;
}
