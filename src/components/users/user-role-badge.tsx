import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types/domain";

const roleMeta: Record<UserRole, { label: string; className: string }> = {
  cliente: { label: "Cliente", className: "border-slate-200 bg-slate-50 text-slate-700" },
  vendedor_vip: { label: "Vendedor VIP", className: "border-amber-200 bg-amber-50 text-amber-800" },
  administrador: { label: "Administrador", className: "border-blue-200 bg-blue-50 text-msm-blue" },
  administrador_economico: {
    label: "Admin economico",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  superadmin: { label: "Superadmin", className: "border-purple-200 bg-purple-50 text-purple-800" }
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const meta = roleMeta[role] ?? roleMeta.cliente;
  return <Badge className={meta.className}>{meta.label}</Badge>;
}
