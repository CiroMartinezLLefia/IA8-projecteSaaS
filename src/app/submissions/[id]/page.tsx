import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  const submissionId = resolvedParams.id;

  // Obtenim la informació del lliurament amb l'enunciat, l'alumne i els comentaris
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: true,
      statement: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Botó de tornada a l'enunciat */}
      <div>
        <Link
          href={`/statements/${submission.statementId}`}
          className="text-xs font-mono text-zinc-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          &larr; Tornar a l'enunciat: {submission.statement.title}
        </Link>
      </div>

      {/* Targeta informativa del lliurament */}
      <div className="border border-zinc-800 bg-zinc-950 p-6 rounded-lg space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-900 pb-4">
          <div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded mr-2">
              {submission.statement.module}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-900 text-emerald-400 rounded">
              {submission.statement.ia}
            </span>
            <h1 className="text-xl font-bold text-white mt-2">
              Lliurament de {submission.student.name}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Correu de l'estudiant: {submission.student.email}
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            Pujat el{" "}
            {new Date(submission.createdAt).toLocaleDateString("ca-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <span className="block text-[10px] font-mono uppercase text-zinc-500">
              Projecte en Producció (Vercel / Netlify / etc):
            </span>
            <a
              href={submission.productionUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline bg-emerald-950/15 border border-emerald-900/40 p-3 rounded text-center transition-colors break-all"
            >
              🚀 {submission.productionUrl}
            </a>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[10px] font-mono uppercase text-zinc-500">
              Repositori de Codi Font (GitHub):
            </span>
            {submission.repositoryUrl ? (
              <a
                href={submission.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-xs font-bold text-zinc-300 hover:text-white hover:underline bg-zinc-900/50 border border-zinc-850 p-3 rounded text-center transition-colors break-all"
              >
                📦 {submission.repositoryUrl}
              </a>
            ) : (
              <div className="text-xs text-zinc-650 bg-zinc-900/20 border border-zinc-900 p-3 rounded text-center italic">
                No s'ha aportat repositori públic.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secció del fòrum de comentaris */}
      <div className="border border-zinc-900 bg-black/40 p-6 rounded-lg">
        <CommentSection
          submissionId={submissionId}
          comments={submission.comments}
          currentUser={
            user
              ? {
                  id: user.id,
                  name: user.name,
                  role: user.role,
                  status: user.status,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
