"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/server/actions/auth";

export function LogoutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logout())}
      className={
        className ??
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      }
    >
      <LogOut size={16} />
      {pending ? "Cerrando..." : "Cerrar sesion"}
    </button>
  );
}
