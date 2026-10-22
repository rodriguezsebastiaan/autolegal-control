import Link from "next/link";
import { PageHeader } from "@/components/ui";

export default function NoPermissionPage() { return <><PageHeader title="Acceso restringido" description="Tu rol no permite realizar esta operación." /><Link className="btn-secondary" href="/dashboard">Volver al panel</Link></>; }
