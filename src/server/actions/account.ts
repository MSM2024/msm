"use server";

import { revalidatePath } from "next/cache";
import {
  avatarUploadSchema,
  profileUpdateSchema,
  securityUpdateSchema
} from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { STORAGE_BUCKETS, extensionForType, uploadFile } from "@/lib/storage";
import type { ActionResult } from "@/types/actions";

function checkboxToBool(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

export async function updateProfile(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = profileUpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion requerida para actualizar el perfil." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp || null,
        country: parsed.data.country || null,
        address: parsed.data.address || null,
        bio: parsed.data.bio || null,
        preferred_language: parsed.data.preferredLanguage,
        timezone: parsed.data.timezone || null,
        notification_email_enabled: checkboxToBool(formData.get("notificationEmailEnabled")),
        notification_whatsapp_enabled: checkboxToBool(formData.get("notificationWhatsappEnabled")),
        profile_completed_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }

    await writeAuditLog({
      actorId: user.id,
      action: "profile.update",
      entity: "profile",
      entityId: user.id,
      after: { fullName: parsed.data.fullName, country: parsed.data.country }
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar." };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true, message: "Perfil actualizado." };
}

export async function updateAvatar(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona una imagen para tu avatar." };
  }

  const parsed = avatarUploadSchema.safeParse({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Imagen invalida." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion requerida para subir tu avatar." };
  }

  const ext = extensionForType(file.type);
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const result = await uploadFile(STORAGE_BUCKETS.avatars, path, buffer, file.type);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ avatar_url: result.publicUrl })
      .eq("id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }

    await writeAuditLog({
      actorId: user.id,
      action: "avatar.update",
      entity: "profile",
      entityId: user.id,
      after: { avatarUrl: result.publicUrl }
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar el avatar." };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true, message: "Avatar actualizado." };
}

export async function removeAvatar(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion requerida." };
  }

  try {
    const admin = createAdminClient();
    await admin.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    await writeAuditLog({
      actorId: user.id,
      action: "avatar.remove",
      entity: "profile",
      entityId: user.id
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo eliminar el avatar." };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true, message: "Avatar eliminado." };
}

export async function updateSecurity(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = securityUpdateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, message: "Sesion requerida para cambiar la contrasena." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword
  });

  if (signInError) {
    return { ok: false, message: "La contrasena actual no es correcta." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message };
  }

  await writeAuditLog({
    actorId: user.id,
    action: "password.update",
    entity: "profile",
    entityId: user.id
  });

  return { ok: true, message: "Contrasena actualizada correctamente." };
}
