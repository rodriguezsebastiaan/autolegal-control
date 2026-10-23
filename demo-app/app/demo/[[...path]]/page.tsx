import { redirect } from "next/navigation";

export default async function LegacyDemoRedirect({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  redirect(`/panel${path.length ? `/${path.join("/")}` : ""}`);
}
