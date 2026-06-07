import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";


interface PageProps {
  searchParams: Promise<{ query?: string; module?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  
  const query = params.query || "";
  const selectedModule = params.module || "";

  // Construïm el filtre per a Prisma
  const whereClause: any = {};
  
  if (selectedModule && selectedModule !== "ALL") {
    whereClause.module = selectedModule;
  }

  if (query) {
    whereClause.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { ia: { contains: query } },
    ];
  }

  // Obtenim els enunciats amb el recompte de lliuraments
  const statements = await prisma.statement.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { submissions: true },
      },
    },
    orderBy: [
      { module: "asc" },
      { title: "asc" },
    ],
  });

  const modules = [
    { code: "ALL", name: "Tots els mòduls" },
    { code: "M0612", name: "M0612 - Desenvolupament Web Client" },
    { code: "M0613", name: "M0613 - Desenvolupament Web Servidor" },
    { code: "M0615", name: "M0615 - Disseny d'Interfícies Web" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Banner de benvinguda */}
      <div className="border border-zinc-800 bg-zinc-950 p-6 sm:p-8 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-2xl">
          <span className="text-emerald-500 font-mono text-xs uppercase tracking-wider font-bold">
            Entorn de Lliuraments dels Alumnes
          </span>
          <h1 className="text-3xl font-black text-white mt-2 leading-tight uppercase tracking-tight sm:text-4xl">
            Comparteix, revisa i aprèn dels lliuraments.
          </h1>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Aquesta plataforma permet als alumnes pujar els enllaços de producció dels seus projectes i rebre feedback mitjançant comentaris de professors i companys.
          </p>
          {!user && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded transition-all"
              >
                Comença a lliurar tasques
              </Link>
              <Link
                href="/login"
                className="text-xs font-bold uppercase tracking-wider border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 rounded hover:bg-zinc-900 transition-all"
              >
                Iniciar sessió
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Cercador i Filtres per mòduls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-6">
        {/* Filtres per mòdul */}
        <div className="flex flex-wrap gap-2">
          {modules.map((mod) => (
            <Link
              key={mod.code}
              href={{
                pathname: "/",
                query: {
                  ...(query ? { query } : {}),
                  module: mod.code,
                },
              }}
              className={`text-xs px-3 py-1.5 rounded font-medium border transition-colors ${
                (mod.code === "ALL" && !selectedModule) || selectedModule === mod.code
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500"
                  : "bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800 hover:text-zinc-200"
              }`}
            >
              {mod.code === "ALL" ? mod.name : mod.code}
            </Link>
          ))}
        </div>

        {/* Formulari de cerca */}
        <form method="GET" action="/" className="flex items-center gap-2">
          <input
            type="hidden"
            name="module"
            value={selectedModule}
          />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Cerca enunciats..."
            className="w-full md:w-64 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none placeholder-zinc-600"
          />
          <button
            type="submit"
            className="bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded text-xs font-semibold"
          >
            Cercar
          </button>
          {query && (
            <Link
              href={{ pathname: "/", query: selectedModule ? { module: selectedModule } : {} }}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline font-mono"
            >
              Netejar
            </Link>
          )}
        </form>
      </div>

      {/* Botó de l'admin per afegir un nou enunciat */}
      {user && user.role === "ADMIN" && (
        <div className="flex justify-end">
          <Link
            href="/admin?tab=statements"
            className="text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded transition-all"
          >
            + Crear Nou Enunciat
          </Link>
        </div>
      )}

      {/* Grid d'enunciats */}
      {statements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statements.map((st) => (
            <div
              key={st.id}
              className="flex flex-col border border-zinc-800 bg-zinc-950/50 rounded-lg overflow-hidden neon-border"
            >
              <div className="relative h-40 w-full bg-zinc-900 border-b border-zinc-900">
                <Image
                  src={st.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"}
                  alt={st.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover opacity-60 hover:opacity-80 transition-opacity duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-black/80 border border-zinc-800 text-zinc-400 rounded">
                    {st.module}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950/80 border border-emerald-900 text-emerald-400 rounded">
                    {st.ia}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black/90 border border-zinc-800 text-zinc-300 rounded">
                    {st._count.submissions} {st._count.submissions === 1 ? "lliurament" : "lliuraments"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {st.description}
                  </p>
                </div>
                <div className="pt-4 mt-auto">
                  <Link
                    href={`/statements/${st.id}`}
                    className="block text-center text-xs font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-white py-2 rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    Detalls i lliuraments
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-zinc-900 bg-zinc-950/30 p-12 rounded-lg text-center">
          <span className="text-2xl block mb-2">🔍</span>
          <p className="text-sm font-semibold text-zinc-400">No s'ha trobat cap enunciat.</p>
          <p className="text-xs text-zinc-600 mt-1">Prova a fer una cerca diferent o canvia els filtres.</p>
        </div>
      )}
    </div>
  );
}
