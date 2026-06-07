"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleUserValidationAction(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "No autoritzat." };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, error: "L'usuari no existeix." };
    }

    // Toggle status
    const newStatus = targetUser.status === "VALIDATED" ? "PENDING" : "VALIDATED";

    await prisma.user.update({
      where: { id: targetUserId },
      data: { status: newStatus },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error canviant la validació de l'usuari:", error);
    return { success: false, error: "S'ha produït un error en actualitzar l'usuari." };
  }
}

export async function changeUserRoleAction(targetUserId: string, newRole: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "No autoritzat." };
  }

  if (newRole !== "ADMIN" && newRole !== "STUDENT") {
    return { success: false, error: "Rol no vàlid." };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, error: "L'usuari no existeix." };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error canviant el rol de l'usuari:", error);
    return { success: false, error: "S'ha produït un error en actualitzar l'usuari." };
  }
}
