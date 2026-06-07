"use client";

import React, { useState } from "react";
import { createCommentAction, updateCommentAction, deleteCommentAction } from "@/app/actions/comments";

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface CommentWithUser {
  id: string;
  content: string;
  userId: string;
  parentId: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface CommentSectionProps {
  submissionId: string;
  comments: CommentWithUser[];
  currentUser: User | null;
}

export default function CommentSection({ submissionId, comments, currentUser }: CommentSectionProps) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Filtrem comentaris arrel i agrupem respostes
  const rootComments = comments.filter((c) => !c.parentId);
  const repliesMap: { [key: string]: CommentWithUser[] } = {};
  comments.forEach((c) => {
    if (c.parentId) {
      if (!repliesMap[c.parentId]) {
        repliesMap[c.parentId] = [];
      }
      repliesMap[c.parentId].push(c);
    }
  });

  const handleCreateRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newCommentText.trim()) return;

    const formData = new FormData();
    formData.append("content", newCommentText);
    
    const res = await createCommentAction(submissionId, null, null, formData);
    if (res.success) {
      setNewCommentText("");
    } else {
      setError(res.error || "Error en crear el comentari.");
    }
  };

  const handleCreateReply = async (parentId: string) => {
    setError(null);
    if (!replyText.trim()) return;

    const formData = new FormData();
    formData.append("content", replyText);

    const res = await createCommentAction(submissionId, parentId, null, formData);
    if (res.success) {
      setReplyText("");
      setActiveReplyId(null);
    } else {
      setError(res.error || "Error en respondre al comentari.");
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    setError(null);
    if (!editText.trim()) return;

    const formData = new FormData();
    formData.append("content", editText);

    const res = await updateCommentAction(commentId, null, formData);
    if (res.success) {
      setEditText("");
      setActiveEditId(null);
    } else {
      setError(res.error || "Error en actualitzar el comentari.");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Estàs segur que vols eliminar aquest comentari?")) {
      setError(null);
      const res = await deleteCommentAction(commentId);
      if (!res.success) {
        setError(res.error || "Error en eliminar el comentari.");
      }
    }
  };

  // Node recursiu per renderitzar un comentari i les seves respostes
  const CommentNode = ({ comment, depth = 0 }: { comment: CommentWithUser; depth: number }) => {
    const isOwner = currentUser?.id === comment.userId;
    const isAdmin = currentUser?.role === "ADMIN";
    const canDelete = isOwner || isAdmin;
    const canEdit = isOwner;
    const isPendingStudent = currentUser?.role === "STUDENT" && currentUser?.status !== "VALIDATED";
    
    const commentReplies = repliesMap[comment.id] || [];

    return (
      <div className="space-y-3">
        {/* Caixa del comentari */}
        <div 
          className={`p-4 rounded border border-zinc-900 bg-zinc-950/30 transition-all ${
            depth > 0 ? "ml-4 sm:ml-6 border-l-2 border-l-emerald-500/40" : ""
          }`}
        >
          {/* Capçalera del comentari */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">
                {comment.user.name}
              </span>
              <span className={`text-[8px] uppercase font-mono px-1 rounded ${
                comment.user.role === "ADMIN" 
                  ? "bg-purple-950/50 text-purple-400 border border-purple-900" 
                  : "bg-zinc-900 text-zinc-500 border border-zinc-800"
              }`}>
                {comment.user.role}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {new Date(comment.createdAt).toLocaleDateString("ca-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Contingut del comentari (Edició o Text normal) */}
          {activeEditId === comment.id ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-2 py-1.5 focus:border-emerald-500"
                rows={2}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setActiveEditId(null);
                    setEditText("");
                  }}
                  className="text-[10px] font-bold uppercase border border-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={() => handleUpdateComment(comment.id)}
                  className="text-[10px] font-bold uppercase bg-emerald-500 hover:bg-emerald-400 text-black px-2.5 py-1 rounded"
                >
                  Desar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap mt-1">
              {comment.content}
            </p>
          )}

          {/* Accions de comentaris (Respondre, Editar, Eliminar) */}
          {!activeEditId && (
            <div className="flex gap-3 justify-end items-center mt-3 pt-2 border-t border-zinc-950 text-[10px] font-mono font-semibold uppercase text-zinc-500">
              {currentUser && !isPendingStudent && (
                <button
                  onClick={() => {
                    setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                    setReplyText("");
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {activeReplyId === comment.id ? "Tancar" : "Respondre"}
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => {
                    setActiveEditId(comment.id);
                    setEditText(comment.content);
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Editar
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="hover:text-red-400 text-red-900 transition-colors cursor-pointer"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}

          {/* Caixa d'entrada de resposta */}
          {activeReplyId === comment.id && (
            <div className="mt-4 p-3 border border-zinc-800 rounded bg-black/50 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escriu la teva resposta..."
                className="w-full text-xs rounded bg-black border border-zinc-800 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setActiveReplyId(null);
                    setReplyText("");
                  }}
                  className="text-[10px] font-bold uppercase border border-zinc-800 text-zinc-450 px-2 py-1 rounded"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={() => handleCreateReply(comment.id)}
                  className="text-[10px] font-bold uppercase bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded"
                >
                  Enviar resposta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Respostes recursives */}
        {commentReplies.length > 0 && (
          <div className="space-y-3">
            {commentReplies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white border-b border-zinc-900 pb-2">
        Discussió al Fòrum ({comments.length} comentaris)
      </h3>

      {error && (
        <div className="text-xs text-red-400 border border-red-950/30 bg-red-950/20 py-2 px-3 rounded">
          ⚠️ {error}
        </div>
      )}

      {/* Formulari per a un nou comentari arrel */}
      {currentUser ? (
        currentUser.role === "STUDENT" && currentUser.status !== "VALIDATED" ? (
          <div className="border border-amber-950 bg-amber-950/10 p-4 rounded text-xs text-zinc-400">
            ⚠️ El teu compte d'alumne està pendent de validació. Has d'estar validat pel professor per poder publicar comentaris.
          </div>
        ) : (
          <form onSubmit={handleCreateRootComment} className="space-y-3">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Afegeix un comentari sobre aquest lliurament..."
              required
              rows={3}
              className="w-full text-xs rounded bg-zinc-950 border border-zinc-800 text-white px-3 py-2.5 focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded transition-all"
              >
                Enviar comentari
              </button>
            </div>
          </form>
        )
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded text-center text-xs text-zinc-500">
          Has de{" "}
          <a href="/login" className="text-emerald-500 underline font-medium">
            iniciar sessió
          </a>{" "}
          per poder participar al fòrum de discussió.
        </div>
      )}

      {/* Llistat de comentaris */}
      {rootComments.length > 0 ? (
        <div className="space-y-4 pt-2">
          {rootComments.map((comment) => (
            <CommentNode key={comment.id} comment={comment} depth={0} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-zinc-950 rounded">
          <span className="text-xl block mb-1">💬</span>
          <p className="text-xs italic text-zinc-650">No hi ha cap comentari. Sigues el primer en escriure!</p>
        </div>
      )}
    </div>
  );
}
