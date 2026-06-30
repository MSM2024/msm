"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { updateProfile } from "@/server/actions/account";
import { emptyActionResult } from "@/types/actions";
import type { SessionProfile } from "@/lib/auth/session";

const countries = [
  "Cuba",
  "Estados Unidos",
  "Espana",
  "Mexico",
  "Canada",
  "Italia",
  "Brasil",
  "Argentina",
  "Chile",
  "Colombia",
  "Panama",
  "Republica Dominicana",
  "Otro"
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-msm-ink">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ProfileForm({ profile }: { profile: SessionProfile }) {
  const [state, formAction, pending] = useActionState(updateProfile, emptyActionResult);
  const [bio, setBio] = useState(profile.bio ?? "");

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo">
          <Input name="fullName" defaultValue={profile.fullName ?? ""} required />
        </Field>
        <Field label="Telefono">
          <Input name="phone" type="tel" defaultValue={profile.phone ?? ""} required />
        </Field>
        <Field label="WhatsApp">
          <Input name="whatsapp" type="tel" defaultValue={profile.whatsapp ?? ""} placeholder="Opcional" />
        </Field>
        <Field label="Pais">
          <Select name="country" defaultValue={profile.country ?? "Cuba"}>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Direccion">
        <Input name="address" defaultValue={profile.address ?? ""} placeholder="Opcional" />
      </Field>

      <Field label={`Bio (${bio.length}/500)`}>
        <Textarea
          name="bio"
          maxLength={500}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Cuentanos algo sobre ti (opcional)."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Idioma preferido">
          <Select name="preferredLanguage" defaultValue={profile.preferredLanguage}>
            <option value="es">Espanol</option>
            <option value="en">English</option>
          </Select>
        </Field>
        <Field label="Zona horaria">
          <Input name="timezone" defaultValue={profile.timezone ?? ""} placeholder="Ej. America/Havana" />
        </Field>
      </div>

      <div className="grid gap-2 rounded-lg border border-msm-line bg-slate-50 p-4">
        <p className="text-sm font-bold text-msm-ink">Notificaciones</p>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            name="notificationEmailEnabled"
            defaultChecked={profile.notificationEmailEnabled}
            className="h-4 w-4 rounded border-msm-silver"
          />
          Recibir avisos por correo
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            name="notificationWhatsappEnabled"
            defaultChecked={profile.notificationWhatsappEnabled}
            className="h-4 w-4 rounded border-msm-silver"
          />
          Recibir avisos por WhatsApp
        </label>
      </div>

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-msm-blue"
              : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar perfil"}
        </Button>
      </div>
    </form>
  );
}
