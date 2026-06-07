"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-10">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-widest text-white uppercase">
            Registrar-se<span className="text-emerald-500 font-bold">//</span>IA8
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Crea un nou compte per penjar lliuraments
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Nom Complet
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full text-sm rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Ex. Joan Garcia"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Correu Electrònic
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full text-sm rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="exemple@saas.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Contrasenya (mínim 6 caràcters)
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full text-sm rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Rol de l'usuari <span className="text-[10px] text-emerald-500">(Per a Proves)</span>
            </label>
            <select
              name="role"
              className="w-full text-sm rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none"
            >
              <option value="STUDENT">Alumne (Pendent de validar)</option>
              <option value="ADMIN">Professor / Administrador (Validat automàticament)</option>
            </select>
            <p className="text-[10px] text-zinc-500 mt-1">
              * Nota: Els alumnes registrats necessiten ser aprovats per un Administrador per poder lliurar tasques o comentar.
            </p>
          </div>

          {state?.error && (
            <div className="text-xs text-red-400 border border-red-950/30 bg-red-950/20 py-2.5 px-3 rounded">
              ⚠️ {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded text-sm font-semibold transition-all neon-glow-button"
          >
            {isPending ? "Creant compte..." : "Crear compte"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          Ja tens un compte?{" "}
          <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-medium">
            Inicia sessió
          </Link>
        </div>
      </div>
    </div>
  );
}
