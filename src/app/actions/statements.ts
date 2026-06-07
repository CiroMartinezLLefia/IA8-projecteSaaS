"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStatementAction(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "No autoritzat. Només els administradors poden crear enunciats." };
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const ia = formData.get("ia")?.toString().trim();
  const module = formData.get("module")?.toString().trim();
  const imageUrl = formData.get("imageUrl")?.toString().trim();

  if (!title || !description || !ia || !module || !imageUrl) {
    return { success: false, error: "Tots els camps són obligatoris." };
  }

  try {
    const statement = await prisma.statement.create({
      data: {
        title,
        description,
        ia,
        module,
        imageUrl,
      },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error creant l'enunciat:", error);
    return { success: false, error: "S'ha produït un error en crear l'enunciat." };
  }

  redirect("/");
}

export async function updateStatementAction(id: string, prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "No autoritzat." };
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const ia = formData.get("ia")?.toString().trim();
  const module = formData.get("module")?.toString().trim();
  const imageUrl = formData.get("imageUrl")?.toString().trim();

  if (!title || !description || !ia || !module || !imageUrl) {
    return { success: false, error: "Tots els camps són obligatoris." };
  }

  try {
    await prisma.statement.update({
      where: { id },
      data: {
        title,
        description,
        ia,
        module,
        imageUrl,
      },
    });

    revalidatePath(`/statements/${id}`);
    revalidatePath("/");
  } catch (error) {
    console.error("Error actualitzant l'enunciat:", error);
    return { success: false, error: "S'ha produït un error en actualitzar l'enunciat." };
  }

  redirect(`/statements/${id}`);
}

export async function deleteStatementAction(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "No autoritzat." };
  }

  try {
    await prisma.statement.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error eliminant l'enunciat:", error);
    return { success: false, error: "S'ha produït un error en eliminar l'enunciat." };
  }
}
