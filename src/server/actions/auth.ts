"use server";

import { redirect } from "next/navigation";
import {
  loginSchema,
  passwordResetSchema,
  resetPasswordSchema,
  signupSchema
} from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { roleHome } from "@/lib/auth/session";
import type { UserRole } from "@/types/domain";
import type { ActionResult } from "@/types/actions";

export async function login(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  let destination = parsed.data.next || "/";

  if (data.user?.id) {
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("role,status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.status === "bloqueado") {
        await supabase.auth.signOut();
        return {
          ok: false,
          message: "Tu cuenta esta bloqueada. Contacta a soporte MSM para revisarla."
        };
      }

      await admin
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", data.user.id);

      await writeAuditLog({
        actorId: data.user.id,
        action: "user.login",
        entity: "profile",
        entityId: data.user.id
      });

      if (!parsed.data.next && profile?.role) {
        destination = roleHome(profile.role as UserRole);
      }
    } catch {
      // If profile lookup fails we still allow the login and fall back to "/".
    }
  }

  redirect(destination);
}

export async function signup(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        country: parsed.data.country,
        role_intent: parsed.data.roleIntent
      }
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.user?.id) {
    try {
      const admin = createAdminClient();
      await admin.from("profiles").upsert({
        id: data.user.id,
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        country: parsed.data.country,
        role: "cliente",
        status: "activo",
        terms_accepted_at: new Date().toISOString()
      });

      await writeAuditLog({
        actorId: data.user.id,
        action: "user.signup",
        entity: "profile",
        entityId: data.user.id,
        after: { role: "cliente", country: parsed.data.country }
      });
    } catch {
      // En local puede no existir service role. Supabase Auth mantiene la cuenta creada.
    }
  }

  const nextStep =
    parsed.data.roleIntent === "vendedor_vip"
      ? " Cuenta creada. Ahora puedes completar la solicitud VIP en /vendedores/solicitud."
      : " Cuenta creada. Ahora puedes completar tu perfil en /account/profile y validar tus datos en /account/kyc.";

  return { ok: true, message: `Listo. Revisa tu correo si Supabase pide confirmacion.${nextStep}` };
}

export async function requestPasswordReset(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = passwordResetSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Correo invalido." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/reset-password`
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await writeAuditLog({
    action: "password.reset_requested",
    entity: "profile",
    after: { email: parsed.data.email }
  });

  return {
    ok: true,
    message: "Si el correo existe en MSM MY STORE, recibira un enlace para recuperar la contrasena."
  };
}

export async function resetPassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "El enlace expiro o no es valido. Solicita uno nuevo en /auth/forgot-password."
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message };
  }

  await writeAuditLog({
    actorId: user.id,
    action: "password.reset",
    entity: "profile",
    entityId: user.id
  });

  return { ok: true, message: "Contrasena actualizada. Ya puedes iniciar sesion." };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user?.id) {
    await writeAuditLog({
      actorId: user.id,
      action: "user.logout",
      entity: "profile",
      entityId: user.id
    });
  }

  redirect("/auth/login");
}
