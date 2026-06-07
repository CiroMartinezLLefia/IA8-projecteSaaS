import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createSubmissionAction, updateSubmissionAction, deleteSubmissionAction } from "@/app/actions/submissions";
import { updateStatementAction, deleteStatementAction } from "@/app/actions/statements";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StatementDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  const statementId = resolvedParams.id;

  // Obtenim l'enunciat i tots els lliuraments associats
  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      submissions: {
        include: {
          student: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!statement) {
    notFound();
  }

  // Busquem el lliurament del propi alumne si està connectat
  const mySubmission = user ? statement.submissions.find((s) => s.studentId === user.id) : null;

  // Funció per esborrar l'enunciat (només cridable per l'admin)
  async function handleDeleteStatement() {
    "use server";
    await deleteStatementAction(statementId);
    redirect("/");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna Esquerra (2/3 d'amplada en pantalles grans): Detall de l'Enunciat i Lliurament Propi */}
      <div className="lg:col-span-2 space-y-8">
        {/* Detalls de l'enunciat */}
        <div className="border border-zinc-800 bg-zinc-950/40 rounded-lg overflow-hidden">
          <div className="relative h-64 w-full bg-zinc-900 border-b border-zinc-800">
            <Image
              src={statement.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"}
              alt={statement.title}
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="text-xs uppercase font-mono px-3 py-1 bg-black border border-zinc-800 text-zinc-300 rounded">
                Mòdul: {statement.module}
              </span>
              <span className="text-xs uppercase font-mono px-3 py-1 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded">
                Tipus: {statement.ia}
              </span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {statement.title}
            </h1>
            <div className="border-t border-zinc-900 pt-4">
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {statement.description}
              </p>
            </div>
          </div>
        </div>

        {/* Zona del lliurament de l'alumne propi */}
        {user ? (
          user.role === "STUDENT" ? (
            user.status === "VALIDATED" ? (
              <div className="border border-zinc-850 bg-zinc-950 p-6 rounded-lg space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                  El teu lliurament
                </h2>

                {mySubmission ? (
                  // L'alumne ja té un lliurament. Mostrem els detalls i opcions d'edició/eliminació.
                  <div className="space-y-6">
                    <div className="bg-black/60 border border-zinc-900 rounded p-4 text-xs font-mono space-y-2">
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500">ESTAT:</span>
                        <span className="text-emerald-400 font-bold">PUJAT CORRECTAMENT</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500">ENLLAÇ DE PRODUCCIÓ:</span>
                        <a
                          href={mySubmission.productionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white hover:text-emerald-400 underline break-all"
                        >
                          {mySubmission.productionUrl}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">REPOSITORI:</span>
                        {mySubmission.repositoryUrl ? (
                          <a
                            href={mySubmission.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:text-emerald-400 underline break-all"
                          >
                            {mySubmission.repositoryUrl}
                          </a>
                        ) : (
                          <span className="text-zinc-650 italic">No especificat</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-4">
                      <h3 className="text-sm font-semibold text-zinc-300 mb-3 uppercase font-mono text-xs">
                        Modificar el lliurament:
                      </h3>
                      <form
                        action={async (formData) => {
                          "use server";
                          await updateSubmissionAction(mySubmission.id, null, formData);
                        }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                              URL Producció (Vercel/Netlify) *
                            </label>
                            <input
                              type="url"
                              name="productionUrl"
                              defaultValue={mySubmission.productionUrl}
                              required
                              className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                              URL Repositori Públic (GitHub)
                            </label>
                            <input
                              type="url"
                              name="repositoryUrl"
                              defaultValue={mySubmission.repositoryUrl || ""}
                              className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-between items-center pt-2">
                          <button
                            type="submit"
                            className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded"
                          >
                            Guardar Canvis
                          </button>
                          
                          <button
                            formAction={async () => {
                              "use server";
                              await deleteSubmissionAction(mySubmission.id);
                            }}
                            type="submit"
                            className="text-[11px] font-bold uppercase tracking-wider border border-red-950 text-red-500 hover:bg-red-950/20 px-3 py-2 rounded"
                          >
                            Eliminar Lliurament
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/submissions/${mySubmission.id}`}
                        className="block text-center text-xs font-bold uppercase tracking-wider border border-emerald-900 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/30 py-2.5 rounded transition-all"
                      >
                        💬 Anar al fil del fòrum ({mySubmission._count.comments} comentaris)
                      </Link>
                    </div>
                  </div>
                ) : (
                  // L'alumne encara no ha penjat res. Formulari per penjar-ho.
                  <form
                    action={async (formData) => {
                      "use server";
                      await createSubmissionAction(statementId, null, formData);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Enllaç de producció (obligatori) *
                        </label>
                        <input
                          type="url"
                          name="productionUrl"
                          placeholder="https://el-teu-projecte.vercel.app"
                          required
                          className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Repositori de codi (recomanat)
                        </label>
                        <input
                          type="url"
                          name="repositoryUrl"
                          placeholder="https://github.com/usuari/repositori"
                          className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded transition-all"
                    >
                      Pujar lliurament
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // Alumne pendent
              <div className="border border-amber-950 bg-amber-950/10 p-5 rounded-lg text-sm text-zinc-400">
                ⚠️ <span className="font-semibold text-amber-500">Compte Pendent d'Aprovació.</span> El teu compte d'alumne encara no ha estat validat pel professor. Podràs lliurar aquest repte tan bon punt siguis aprovat.
              </div>
            )
          ) : (
            // L'usuari connectat és ADMIN. Mostrem opcions de modificació de l'enunciat.
            <div className="border border-purple-900 bg-zinc-950 p-6 rounded-lg space-y-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block"></span>
                Panell del Professor
              </h2>
              
              <div className="bg-black/60 border border-zinc-900 rounded p-4 text-xs font-mono space-y-1">
                <span className="text-purple-400 font-bold block mb-1">ACCIONS D'ADMINISTRADOR</span>
                <p className="text-zinc-500">Com a professor pots actualitzar les dades de l'enunciat o eliminar-lo de la base de dades (això també esborrarà els lliuraments dels alumnes).</p>
              </div>

              <form
                action={async (formData) => {
                  "use server";
                  await updateStatementAction(statementId, null, formData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Títol de l'Enunciat</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={statement.title}
                      required
                      className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">IA Codi (ex. IA1, IA8, Projecte)</label>
                    <input
                      type="text"
                      name="ia"
                      defaultValue={statement.ia}
                      required
                      className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Mòdul</label>
                    <select
                      name="module"
                      defaultValue={statement.module}
                      className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2"
                    >
                      <option value="M0612">M0612 - Desenvolupament Web Client</option>
                      <option value="M0613">M0613 - Desenvolupament Web Servidor</option>
                      <option value="M0615">M0615 - Disseny d'Interfícies Web</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Enllaç de la Imatge *</label>
                    <input
                      type="url"
                      name="imageUrl"
                      defaultValue={statement.imageUrl}
                      required
                      className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Descripció</label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={statement.description}
                    required
                    className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2"
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-between items-center pt-2">
                  <button
                    type="submit"
                    className="text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded transition-all"
                  >
                    Guardar Canvis Enunciat
                  </button>

                  <form action={handleDeleteStatement}>
                    <button
                      type="submit"
                      className="text-xs font-bold uppercase tracking-wider border border-red-950 text-red-500 hover:bg-red-950/20 px-3 py-2.5 rounded transition-all"
                    >
                      Eliminar Enunciat
                    </button>
                  </form>
                </div>
              </form>
            </div>
          )
        ) : (
          // No connectat
          <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-lg text-center">
            <p className="text-zinc-400 text-sm mb-4">
              Inicia sessió o registra't com a alumne per poder penjar el teu lliurament.
            </p>
            <Link
              href="/login"
              className="inline-block text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded transition-all"
            >
              Iniciar sessió per lliurar
            </Link>
          </div>
        )}
      </div>

      {/* Columna Dreta (1/3 d'amplada): Mur de Lliuraments de la Comunitat */}
      <div className="space-y-6">
        <div className="border border-zinc-800 bg-zinc-950 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Mur de lliuraments
            </h2>
            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
              {statement.submissions.length} totals
            </span>
          </div>

          {statement.submissions.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {statement.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded border border-zinc-900 bg-black/40 space-y-2 hover:border-zinc-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {sub.student.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {new Date(sub.createdAt).toLocaleDateString("ca-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {/* Badge indicant el nombre de comentaris */}
                    {sub._count.comments > 0 && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded">
                        💬 {sub._count.comments}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <a
                      href={sub.productionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-950/15 border border-emerald-900/40 p-2 rounded text-center transition-colors break-all"
                    >
                      🚀 Producció: {new URL(sub.productionUrl).hostname}
                    </a>
                    
                    {sub.repositoryUrl && (
                      <a
                        href={sub.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[11px] text-zinc-400 hover:text-white hover:underline bg-zinc-900/50 border border-zinc-850 p-1.5 rounded text-center transition-colors break-all"
                      >
                        📦 Repositori de codi
                      </a>
                    )}
                  </div>

                  <div className="pt-2 text-right">
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="inline-block text-[10px] uppercase tracking-wider font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      Discussió & comentaris &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600">
              <span className="text-xl block mb-1">📭</span>
              <p className="text-xs italic">Encara no s'ha fet cap lliurament per a aquest repte.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
