import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


export default async function PendingPage() {
  const user = await getCurrentUser();

  // Si no està autenticat, el redirigim a login
  if (!user) {
    redirect("/login");
  }

  // Si ja està validat, el redirigim a la pàgina principal
  if (user.role === "ADMIN" || user.status === "VALIDATED") {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-8 rounded-lg text-center shadow-lg shadow-emerald-950/5">
        <div className="w-16 h-16 bg-amber-950/20 border border-amber-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-amber-500">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
          Compte pendent de validació
        </h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Hola, <span className="text-white font-medium">{user.name}</span>. El teu registre s'ha realitzat correctament, però l'administrador del curs (professorat) ha d'aprovar el teu compte abans que puguis enviar lliuraments o escriure comentaris al fòrum.
        </p>
        <div className="space-y-4">
          <div className="text-xs text-zinc-500 bg-black/40 border border-zinc-900 py-3 px-4 rounded text-left">
            <span className="font-mono text-zinc-400 block mb-1">Informació del teu perfil:</span>
            <ul className="space-y-1">
              <li>• Correu: {user.email}</li>
              <li>• Rol original: Alumne (STUDENT)</li>
              <li>• Estat actual: <span className="text-amber-400 font-bold uppercase">PENDENT</span></li>
            </ul>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block text-xs font-semibold tracking-wide uppercase px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded border border-zinc-800 hover:border-zinc-700 transition-colors w-full"
            >
              Anar a la pàgina d'inici (Només lectura)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
