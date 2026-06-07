import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toggleUserValidationAction, changeUserRoleAction } from "@/app/actions/admin";
import { deleteCommentAction } from "@/app/actions/comments";
import { createStatementAction } from "@/app/actions/statements";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


interface PageProps {
  searchParams: Promise<{ tab?: string; userQuery?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const currentUser = await getCurrentUser();

  // Protecció de seguretat: Només administradors
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const activeTab = params.tab || "users";
  const userQuery = params.userQuery || "";

  // 1. Dades per a la pestanya d'Usuaris
  let users: any[] = [];
  if (activeTab === "users") {
    users = await prisma.user.findMany({
      where: userQuery
        ? {
            OR: [
              { name: { contains: userQuery } },
              { email: { contains: userQuery } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Dades per a la pestanya d'Enunciats
  let statements: any[] = [];
  if (activeTab === "statements") {
    statements = await prisma.statement.findMany({
      orderBy: [
        { module: "asc" },
        { title: "asc" },
      ],
    });
  }

  // 3. Dades per a la pestanya de Moderació de Comentaris
  let comments: any[] = [];
  if (activeTab === "comments") {
    comments = await prisma.comment.findMany({
      include: {
        user: true,
        submission: {
          include: {
            statement: true,
            student: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="space-y-8">
      {/* Capçalera del Panell */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-emerald-500 font-mono text-xs uppercase tracking-wider font-bold">
          Espai de Control del Professorat
        </span>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mt-1">
          Panell d'Administració
        </h1>
      </div>

      {/* Menú de Pestanyes (Tabs) */}
      <div className="flex border-b border-zinc-800 gap-4 text-xs font-mono font-semibold uppercase tracking-wider">
        <Link
          href={{ query: { tab: "users" } }}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          👤 Gestió d'Usuaris
        </Link>
        <Link
          href={{ query: { tab: "statements" } }}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "statements"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          📝 Gestió d'Enunciats
        </Link>
        <Link
          href={{ query: { tab: "comments" } }}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "comments"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          🛡️ Moderació Comentaris
        </Link>
      </div>

      {/* Contingut de la Pestanya d'USUARIS */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Cercador d'usuaris */}
          <form method="GET" action="/admin" className="flex items-center gap-2 max-w-md">
            <input type="hidden" name="tab" value="users" />
            <input
              type="text"
              name="userQuery"
              defaultValue={userQuery}
              placeholder="Cerca usuaris per nom o correu..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white"
            />
            <button
              type="submit"
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded text-xs font-semibold"
            >
              Cercar
            </button>
            {userQuery && (
              <Link href="/admin?tab=users" className="text-xs text-zinc-500 underline font-mono">
                Netejar
              </Link>
            )}
          </form>

          {/* Taula d'usuaris */}
          <div className="border border-zinc-800 bg-zinc-950/40 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-black/60 text-zinc-400 uppercase font-mono tracking-wider">
                  <th className="p-4">Nom complet</th>
                  <th className="p-4">Correu Electrònic</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Estat</th>
                  <th className="p-4">Data registre</th>
                  <th className="p-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((usr) => (
                    <tr key={usr.id} className="border-b border-zinc-900 hover:bg-zinc-950/20">
                      <td className="p-4 font-bold text-white">{usr.name}</td>
                      <td className="p-4 font-mono text-zinc-400">{usr.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          usr.role === "ADMIN"
                            ? "bg-purple-950/40 text-purple-400 border-purple-900"
                            : "bg-zinc-900 text-zinc-400 border-zinc-850"
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          usr.status === "VALIDATED"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                            : "bg-amber-950/40 text-amber-400 border-amber-900"
                        }`}>
                          {usr.status === "VALIDATED" ? "VALIDAT" : "PENDENT"}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500 font-mono">
                        {new Date(usr.createdAt).toLocaleDateString("ca-ES")}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {usr.id !== currentUser.id ? (
                          <>
                            {/* Formulari per validar/desvalidar */}
                            <form
                              action={async () => {
                                "use server";
                                await toggleUserValidationAction(usr.id);
                              }}
                              className="inline-block"
                            >
                              <button
                                type="submit"
                                className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded transition-colors cursor-pointer ${
                                  usr.status === "VALIDATED"
                                    ? "border-amber-900 text-amber-500 hover:bg-amber-950/25"
                                    : "border-emerald-900 text-emerald-400 hover:bg-emerald-950/25"
                                }`}
                              >
                                {usr.status === "VALIDATED" ? "Desvalidar" : "Validar"}
                              </button>
                            </form>

                            {/* Formulari per canviar rol */}
                            <form
                              action={async () => {
                                "use server";
                                const nextRole = usr.role === "ADMIN" ? "STUDENT" : "ADMIN";
                                await changeUserRoleAction(usr.id, nextRole);
                              }}
                              className="inline-block"
                            >
                              <button
                                type="submit"
                                className="text-[10px] font-bold uppercase tracking-wider border border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-2 py-1 rounded cursor-pointer"
                              >
                                {usr.role === "ADMIN" ? "Fer Alumne" : "Fer Admin"}
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-zinc-600 font-mono italic text-[10px]">Ets tu</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-600 italic">
                      No s'ha trobat cap usuari.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contingut de la Pestanya d'ENUNCIATS */}
      {activeTab === "statements" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulari per crear nou enunciat */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 rounded-lg space-y-4 lg:col-span-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
              Crear nou enunciat
            </h2>

            <form
              action={async (formData) => {
                "use server";
                await createStatementAction(null, formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Títol de l'Enunciat *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ex: IA1 - Disseny responsive"
                  className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    Codi IA (ex. IA1, IA9) *
                  </label>
                  <input
                    type="text"
                    name="ia"
                    required
                    placeholder="IA1"
                    className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    Mòdul *
                  </label>
                  <select
                    name="module"
                    required
                    className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5"
                  >
                    <option value="M0612">M0612 - Client</option>
                    <option value="M0613">M0613 - Servidor</option>
                    <option value="M0615">M0615 - Disseny</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  URL Imatge associada *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                  Descripció de l'Activitat *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Explica breument en què consisteix el lliurament..."
                  className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                Crear Enunciat
              </button>
            </form>
          </div>

          {/* Llista d'enunciats per poder accedir a edició */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
              Enunciats existents ({statements.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {statements.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
                        {st.module}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded">
                        {st.ia}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{st.title}</h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-zinc-950">
                    <Link
                      href={`/statements/${st.id}`}
                      className="block text-center text-[10px] font-bold uppercase tracking-wider border border-purple-900 text-purple-400 hover:bg-purple-950/20 py-1.5 rounded transition-all"
                    >
                      🛠️ Editar o Eliminar Enunciat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contingut de la Pestanya de MODERACIÓ */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
            Moderació global de comentaris ({comments.length})
          </h2>

          <div className="border border-zinc-800 bg-zinc-950/40 rounded-lg overflow-hidden divide-y divide-zinc-900">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 flex flex-col sm:flex-row justify-between gap-4 items-start hover:bg-zinc-950/20">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className="font-bold text-white">{comment.user.name}</span>
                      <span className="text-zinc-600">a</span>
                      <Link
                        href={`/submissions/${comment.submissionId}`}
                        className="text-emerald-400 hover:underline"
                      >
                        Lliurament de {comment.submission.student.name}
                      </Link>
                      <span className="text-zinc-700">|</span>
                      <span className="text-zinc-500">Activitat: {comment.submission.statement.title}</span>
                      <span className="text-zinc-700">|</span>
                      <span className="text-zinc-500">{new Date(comment.createdAt).toLocaleString("ca-ES")}</span>
                    </div>
                    <p className="text-xs text-zinc-350 bg-black/35 border border-zinc-950/50 p-2.5 rounded italic whitespace-pre-wrap">
                      "{comment.content}"
                    </p>
                  </div>
                  
                  <form
                    action={async () => {
                      "use server";
                      await deleteCommentAction(comment.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-[10px] font-bold uppercase tracking-wider border border-red-950 text-red-500 hover:bg-red-950/20 px-3 py-1.5 rounded transition-all cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-600 italic text-xs">
                No hi ha cap comentari per moderar en tota la base de dades.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
