import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { KycStatus, ProfileStatus, UserRole } from "@/types/domain";

export type SessionUser = {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
};

export type SessionProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  status: ProfileStatus;
  country: string | null;
  address: string | null;
  avatarUrl: string | null;
  bio: string | null;
  whatsapp: string | null;
  preferredLanguage: string;
  timezone: string | null;
  notificationEmailEnabled: boolean;
  notificationWhatsappEnabled: boolean;
  paymentMethodValid: boolean;
  customerKycStatus: KycStatus;
  customerRiskLevel: string;
  emailConfirmedAt: string | null;
  lastLoginAt: string | null;
  profileCompletedAt: string | null;
  termsAcceptedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const PROFILE_COLUMNS =
  "id,email,full_name,phone,role,status,country,address,avatar_url,bio,whatsapp,preferred_language,timezone,notification_email_enabled,notification_whatsapp_enabled,payment_method_valid,customer_kyc_status,customer_risk_level,last_login_at,profile_completed_at,terms_accepted_at,created_at,updated_at";

const roleHomes: Record<UserRole, string> = {
  cliente: "/account",
  vendedor_vip: "/dashboard/vip",
  administrador: "/dashboard/admin",
  administrador_economico: "/dashboard/economic",
  superadmin: "/dashboard/admin"
};

export function roleHome(role: UserRole): string {
  return roleHomes[role] ?? "/account";
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email ?? null,
      emailConfirmedAt: user.email_confirmed_at ?? null
    };
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<SessionProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name ?? null,
      phone: data.phone ?? null,
      role: data.role as UserRole,
      status: (data.status ?? "activo") as ProfileStatus,
      country: data.country ?? null,
      address: data.address ?? null,
      avatarUrl: data.avatar_url ?? null,
      bio: data.bio ?? null,
      whatsapp: data.whatsapp ?? null,
      preferredLanguage: data.preferred_language ?? "es",
      timezone: data.timezone ?? null,
      notificationEmailEnabled: data.notification_email_enabled ?? true,
      notificationWhatsappEnabled: data.notification_whatsapp_enabled ?? false,
      paymentMethodValid: data.payment_method_valid ?? false,
      customerKycStatus: (data.customer_kyc_status ?? "pendiente") as KycStatus,
      customerRiskLevel: data.customer_risk_level ?? "normal",
      emailConfirmedAt: user.emailConfirmedAt,
      lastLoginAt: data.last_login_at ?? null,
      profileCompletedAt: data.profile_completed_at ?? null,
      termsAcceptedAt: data.terms_accepted_at ?? null,
      createdAt: data.created_at ?? null,
      updatedAt: data.updated_at ?? null
    };
  } catch {
    return null;
  }
}

export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login");
  }
  return user;
}

export async function requireProfile(next?: string): Promise<SessionProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login");
  }
  return profile;
}

export async function requireRole(
  roles: readonly UserRole[],
  options?: { next?: string }
): Promise<SessionProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(options?.next ? `/auth/login?next=${encodeURIComponent(options.next)}` : "/auth/login");
  }
  if (!roles.includes(profile.role)) {
    redirect("/");
  }
  return profile;
}

export function requireAdmin(options?: { next?: string }): Promise<SessionProfile> {
  return requireRole(["administrador", "superadmin"], options);
}

export function requireSuperadmin(options?: { next?: string }): Promise<SessionProfile> {
  return requireRole(["superadmin"], options);
}
