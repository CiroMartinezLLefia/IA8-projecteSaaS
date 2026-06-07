"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-10">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-widest text-white uppercase">
            Iniciar sessió<span className="text-emerald-500 font-bold">//</span>IA8
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Entra a la teva plataforma de lliuraments
          </p>
        </div>

        {/* Credencials de prova per al professor */}
        <div className="mb-6 border border-emerald-950 bg-emerald-950/10 p-4 rounded text-xs leading-relaxed text-zinc-400">
          <span className="font-bold text-emerald-400 block mb-1">🔑 Comptes de Prova (Accés Ràpid):</span>
          <ul className="space-y-1 font-mono text-[11px]">
            <li>
              <span className="text-zinc-300">Admin:</span> admin@saas.com / adminpassword
            </li>
            <li>
              <span className="text-zinc-300">Alumne Validat:</span> student@saas.com / studentpassword
            </li>
            <li>
              <span className="text-zinc-300">Alumne Pendent:</span> pending@saas.com / pendingpassword
            </li>
          </ul>
        </div>

        <form action={formAction} className="space-y-4">
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
              Contrasenya
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full text-sm rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="••••••••"
            />
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
            {isPending ? "Validant..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          No tens un compte?{" "}
          <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-medium">
            Registra't aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
