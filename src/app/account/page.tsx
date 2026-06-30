import Link from "next/link";
import Image from "next/image";
import { CircleUserRound, IdCard, MailCheck, MailWarning, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AccountNav } from "@/components/account/account-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { requireProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const profile = await requireProfile("/account");

  const emailConfirmed = Boolean(profile.emailConfirmedAt);
  const completion = [
    profile.fullName,
    profile.phone,
    profile.country,
    profile.avatarUrl,
    profile.customerKycStatus === "aprobado" ? "kyc" : null
  ].filter(Boolean).length;
  const completionPct = Math.round((completion / 5) * 100);

  return (
    <AppShell>
      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge>Mi cuenta MSM</Badge>
            <h1 className="mt-3 text-3xl font-bold text-msm-ink">Hola, {profile.fullName ?? "cliente MSM"}</h1>
            <p className="mt-1 text-slate-600">Gestiona tu perfil, seguridad y validacion de cuenta.</p>
          </div>
          <LogoutButton />
        </div>

        <AccountNav />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-msm-line bg-slate-50">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.fullName ?? "Avatar"} fill sizes="64px" unoptimized className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-slate-400">
                    <UserRound size={28} />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-msm-ink">{profile.email}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <UserRoleBadge role={profile.role} />
                  <UserStatusBadge status={profile.status} />
                </div>
              </div>
            </div>

            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-500">Correo confirmado</dt>
                <dd className="font-bold">
                  {emailConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700"><MailCheck size={15} /> Si</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700"><MailWarning size={15} /> Pendiente</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-500">Telefono</dt>
                <dd className="font-bold text-msm-ink">{profile.phone ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-500">Pais</dt>
                <dd className="font-bold text-msm-ink">{profile.country ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-slate-500">KYC</dt>
                <dd className="font-bold text-msm-ink capitalize">{profile.customerKycStatus.replace("_", " ")}</dd>
              </div>
            </dl>
          </article>

          <div className="grid gap-4">
            <article className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-msm-ink">Completitud del perfil</h2>
                <span className="text-sm font-black text-msm-blue">{completionPct}%</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-msm-blue transition-all" style={{ width: `${completionPct}%` }} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href="/account/profile" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-msm-line bg-white px-3 text-sm font-bold text-msm-ink transition hover:border-msm-blue hover:text-msm-blue">
                  <CircleUserRound size={17} /> Editar perfil
                </Link>
                <Link href="/account/security" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-msm-line bg-white px-3 text-sm font-bold text-msm-ink transition hover:border-msm-blue hover:text-msm-blue">
                  <ShieldCheck size={17} /> Seguridad
                </Link>
                <Link href="/account/kyc" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-msm-line bg-white px-3 text-sm font-bold text-msm-ink transition hover:border-msm-blue hover:text-msm-blue">
                  <IdCard size={17} /> Validar cuenta (KYC)
                </Link>
                <Link href="/orders" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-msm-line bg-white px-3 text-sm font-bold text-msm-ink transition hover:border-msm-blue hover:text-msm-blue">
                  Mis ordenes
                </Link>
              </div>
            </article>

            {profile.status !== "activo" ? (
              <article className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
                Tu cuenta esta {profile.status}. Si crees que es un error, abre un caso en /support.
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
