"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/server/actions/auth";
import { emptyActionResult } from "@/types/actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-3">
      <Input name="password" type="password" placeholder="Nueva contrasena" required />
      <Input name="confirmPassword" type="password" placeholder="Confirmar nueva contrasena" required />
      <p className="text-xs font-semibold text-slate-500">
        Minimo 8 caracteres con mayuscula, minuscula y numero.
      </p>
      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold leading-6 text-msm-blue"
              : "rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700"
          }
        >
          <span className="inline-flex items-center gap-2">
            {state.ok ? <ShieldCheck size={16} /> : null}
            {state.message}
          </span>
          {state.ok ? (
            <div className="mt-2">
              <Link href="/auth/login" className="underline underline-offset-4">
                Ir a iniciar sesion
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar nueva contrasena"}
      </Button>
    </form>
  );
}
