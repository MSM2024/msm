"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImageUp, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeAvatar, updateAvatar } from "@/server/actions/account";
import { emptyActionResult } from "@/types/actions";

export function AvatarUpload({ avatarUrl, fullName }: { avatarUrl: string | null; fullName: string | null }) {
  const [state, formAction, pending] = useActionState(updateAvatar, emptyActionResult);
  const [preview, setPreview] = useState<string | null>(null);
  const [removing, startRemove] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const shownImage = preview ?? avatarUrl;

  return (
    <div className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
      <h2 className="font-bold text-msm-ink">Foto de perfil</h2>
      <p className="mt-1 text-sm text-slate-600">PNG, JPG, WEBP o GIF. Maximo 5MB.</p>

      <form action={formAction} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-msm-line bg-slate-50">
          {shownImage ? (
            <Image src={shownImage} alt={fullName ?? "Avatar"} fill sizes="80px" unoptimized className="object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-slate-400">
              <UserRound size={32} />
            </span>
          )}
        </div>

        <div className="grid flex-1 gap-3">
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="block w-full text-sm font-semibold text-slate-600 file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-msm-blue file:px-3 file:text-sm file:font-bold file:text-white hover:file:bg-msm-electric"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              <ImageUp size={16} className="mr-1" />
              {pending ? "Subiendo..." : "Guardar foto"}
            </Button>
            {avatarUrl ? (
              <button
                type="button"
                disabled={removing}
                onClick={() =>
                  startRemove(async () => {
                    await removeAvatar();
                    setPreview(null);
                    if (inputRef.current) inputRef.current.value = "";
                  })
                }
                className="inline-flex min-h-11 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 size={15} />
                {removing ? "Eliminando..." : "Eliminar"}
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {state.message ? (
        <p
          className={
            state.ok
              ? "mt-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-msm-blue"
              : "mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
