"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  ["/account", "Resumen"],
  ["/account/profile", "Perfil"],
  ["/account/security", "Seguridad"],
  ["/account/kyc", "Validacion"]
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map(([href, label]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-bold transition",
              active
                ? "border-msm-blue bg-msm-blue text-white shadow-soft"
                : "border-msm-line bg-white text-slate-600 hover:border-msm-blue hover:text-msm-blue"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
