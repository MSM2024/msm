import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { AccountNav } from "@/components/account/account-nav";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { ProfileForm } from "@/components/account/profile-form";
import { requireProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const profile = await requireProfile("/account/profile");

  return (
    <AppShell>
      <section className="mx-auto grid max-w-3xl gap-5 px-4 py-6 pb-24">
        <div>
          <Badge>Mi cuenta MSM</Badge>
          <h1 className="mt-3 text-3xl font-bold text-msm-ink">Editar perfil</h1>
          <p className="mt-1 text-slate-600">Actualiza tus datos, foto y preferencias.</p>
        </div>

        <AccountNav />
        <AvatarUpload avatarUrl={profile.avatarUrl} fullName={profile.fullName} />

        <div className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
          <ProfileForm profile={profile} />
        </div>
      </section>
    </AppShell>
  );
}
