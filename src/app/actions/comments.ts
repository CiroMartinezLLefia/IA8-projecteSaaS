"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCommentAction(
  submissionId: string,
  parentId: string | null,
  prevState: any,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Has d'iniciar sessió per comentar." };
  }
  if (user.status !== "VALIDATED") {
    return { success: false, error: "El teu compte ha d'estar validat per comentar." };
  }

  const content = formData.get("content")?.toString().trim();
  if (!content) {
    return { success: false, error: "El contingut del comentari no pot estar buit." };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        submissionId,
        userId: user.id,
        parentId: parentId || null,
      },
    });

    revalidatePath(`/submissions/${submissionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creant el comentari:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }
}

export async function updateCommentAction(commentId: string, prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Has d'iniciar sessió." };
  }

  const content = formData.get("content")?.toString().trim();
  if (!content) {
    return { success: false, error: "El contingut no pot estar buit." };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "El comentari no existeix." };
    }

    if (comment.userId !== user.id) {
      return { success: false, error: "No tens permís per editar aquest comentari." };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    revalidatePath(`/submissions/${comment.submissionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error actualitzant el comentari:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }
}

export async function deleteCommentAction(commentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Has d'iniciar sessió." };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "El comentari no existeix." };
    }

    if (comment.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "No tens permís per eliminar aquest comentari." };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/submissions/${comment.submissionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error eliminant el comentari:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }
}
