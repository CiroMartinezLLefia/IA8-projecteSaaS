"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSubmissionAction(statementId: string, prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Has d'iniciar sessió per lliurar feina." };
  }
  if (user.role !== "STUDENT" || user.status !== "VALIDATED") {
    return { success: false, error: "Només els alumnes validats poden lliurar feina." };
  }

  const productionUrl = formData.get("productionUrl")?.toString().trim();
  const repositoryUrl = formData.get("repositoryUrl")?.toString().trim();

  if (!productionUrl) {
    return { success: false, error: "L'enllaç de producció és obligatori." };
  }

  try {
    // Comprovar si ja té un lliurament per a aquest enunciat
    const existing = await prisma.submission.findFirst({
      where: {
        statementId,
        studentId: user.id,
      },
    });

    if (existing) {
      return { success: false, error: "Ja has fet un lliurament per a aquest enunciat. Si us plau, edita el que ja tens creat." };
    }

    const submission = await prisma.submission.create({
      data: {
        productionUrl,
        repositoryUrl: repositoryUrl || null,
        studentId: user.id,
        statementId,
      },
    });

    revalidatePath(`/statements/${statementId}`);
    return { success: true, submissionId: submission.id };
  } catch (error) {
    console.error("Error creant el lliurament:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }
}

export async function updateSubmissionAction(submissionId: string, prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Has d'iniciar sessió." };
  }

  const productionUrl = formData.get("productionUrl")?.toString().trim();
  const repositoryUrl = formData.get("repositoryUrl")?.toString().trim();

  if (!productionUrl) {
    return { success: false, error: "L'enllaç de producció és obligatori." };
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return { success: false, error: "El lliurament no existeix." };
    }

    // Només el propietari del lliurament pot modificar-lo
    if (submission.studentId !== user.id) {
      return { success: false, error: "No tens permís per editar aquest lliurament." };
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        productionUrl,
        repositoryUrl: repositoryUrl || null,
      },
    });

    revalidatePath(`/statements/${submission.statementId}`);
    revalidatePath(`/submissions/${submissionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error actualitzant el lliurament:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }
}

export async function deleteSubmissionAction(submissionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Has d'iniciar sessió." };
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return { success: false, error: "El lliurament no existeix." };
    }

    // El propietari o un admin poden eliminar el lliurament
    if (submission.studentId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "No tens permís per eliminar aquest lliurament." };
    }

    await prisma.submission.delete({
      where: { id: submissionId },
    });

    revalidatePath(`/statements/${submission.statementId}`);
    return { success: true };
  } catch (error) {
    console.error("Error eliminant el lliurament:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }
}
