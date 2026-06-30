"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSecurity } from "@/server/actions/account";
import { emptyActionResult } from "@/types/actions";

export function SecurityForm() {
  const [state, formAction, pending] = useActionState(updateSecurity, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-3">
      <Input name="currentPassword" type="password" placeholder="Contrasena actual" required autoComplete="current-password" />
      <Input name="password" type="password" placeholder="Nueva contrasena" required autoComplete="new-password" />
      <Input name="confirmPassword" type="password" placeholder="Confirmar nueva contrasena" required autoComplete="new-password" />
      <p className="text-xs font-semibold text-slate-500">
        Minimo 8 caracteres con mayuscula, minuscula y numero.
      </p>
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
          {pending ? "Guardando..." : "Cambiar contrasena"}
        </Button>
      </div>
    </form>
  );
}
