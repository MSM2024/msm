import { Badge } from "@/components/ui/badge";
import type { ProfileStatus } from "@/types/domain";

const statusMeta: Record<ProfileStatus, { label: string; className: string }> = {
  activo: { label: "Activo", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  pausado: { label: "Pausado", className: "border-amber-200 bg-amber-50 text-amber-800" },
  bloqueado: { label: "Bloqueado", className: "border-red-200 bg-red-50 text-red-700" }
};

export function UserStatusBadge({ status }: { status: ProfileStatus }) {
  const meta = statusMeta[status] ?? statusMeta.activo;
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
