import { MailCheck, MailWarning, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AccountNav } from "@/components/account/account-nav";
import { SecurityForm } from "@/components/account/security-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("es");
  } catch {
    return value;
  }
}

export default async function AccountSecurityPage() {
  const profile = await requireProfile("/account/security");
  const emailConfirmed = Boolean(profile.emailConfirmedAt);

  return (
    <AppShell>
      <section className="mx-auto grid max-w-3xl gap-5 px-4 py-6 pb-24">
        <div>
          <Badge>Mi cuenta MSM</Badge>
          <h1 className="mt-3 text-3xl font-bold text-msm-ink">Seguridad de la cuenta</h1>
          <p className="mt-1 text-slate-600">Controla tu acceso y protege tu cuenta.</p>
        </div>

        <AccountNav />

        <div className="grid gap-4 rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Correo</span>
              <span className="font-bold text-msm-ink">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Estado de correo</span>
              <span className="font-bold">
                {emailConfirmed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700"><MailCheck size={15} /> Confirmado</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700"><MailWarning size={15} /> Pendiente</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Ultimo acceso</span>
              <span className="font-bold text-msm-ink">{formatDate(profile.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <h2 className="font-bold text-msm-ink">Cambiar contrasena</h2>
          <p className="mt-1 text-sm text-slate-600">Confirma tu contrasena actual para definir una nueva.</p>
          <div className="mt-4">
            <SecurityForm />
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-semibold leading-6 text-msm-blue">
          <ShieldAlert size={16} className="mr-1 inline" />
          La verificacion en dos pasos (MFA) llegara en una fase proxima. MSM nunca te pide tu clave por WhatsApp.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <div>
            <h2 className="font-bold text-msm-ink">Cerrar sesion</h2>
            <p className="mt-1 text-sm text-slate-600">Sal de tu cuenta en este dispositivo.</p>
          </div>
          <LogoutButton />
        </div>
      </section>
    </AppShell>
  );
}
