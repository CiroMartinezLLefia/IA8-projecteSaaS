"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, loginSession, logoutSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Si us plau, omple tots els camps." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "Correu electrònic o contrasenya incorrectes." };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Correu electrònic o contrasenya incorrectes." };
    }

    await loginSession(user.id);
    
    // Si l'usuari està pendent, el redirigim a la pàgina de pendent
    if (user.role === "STUDENT" && user.status === "PENDING") {
      redirect("/pending");
    }
  } catch (error: any) {
    // NextJS redirect llança un error intern, hem de deixar que es propagui
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error en iniciar sessió:", error);
    return { success: false, error: "S'ha produït un error al servidor." };
  }

  redirect("/");
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const roleSelection = formData.get("role")?.toString(); // Allows student/admin registration for testing if selected, defaults to STUDENT

  if (!name || !email || !password) {
    return { success: false, error: "Si us plau, omple tots els camps." };
  }

  if (password.length < 6) {
    return { success: false, error: "La contrasenya ha de tenir almenys 6 caràcters." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Aquest correu electrònic ja està registrat." };
    }

    const passwordHash = hashPassword(password);
    const role = roleSelection === "ADMIN" ? "ADMIN" : "STUDENT";
    const status = role === "ADMIN" ? "VALIDATED" : "PENDING"; // admins are automatically validated, students pending

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        status,
      },
    });

    await loginSession(user.id);

    if (status === "PENDING") {
      redirect("/pending");
    }
  } catch (error: any) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error en registrar l'usuari:", error);
    return { success: false, error: "S'ha produït un error en registrar l'usuari." };
  }

  redirect("/");
}

export async function logoutAction() {
  await logoutSession();
  redirect("/login");
}
