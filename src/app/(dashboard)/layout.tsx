import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Sidebar userName={user.name} organizationMode={user.organization.mode} />
      <main className="dashboard-main ml-64 min-h-screen">
        <Topbar organization={user.organization.name} />
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
