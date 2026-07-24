"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@lib/supabase/server";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  if (!email || !email.includes("@")) {
    return { error: "Ingresa tu correo electrónico válido." };
  }

  if (!password) {
    return { error: "La contraseña es obligatoria." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "El correo o la contraseña no son correctos." };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signupAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const displayName = formData.get("displayName") as string;

  if (!email || !email.includes("@")) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();

  const origin = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message || "Error al registrar la cuenta. Inténtalo de nuevo." };
  }

  return {
    success: true,
    message: "Revisa tu correo electrónico para confirmar tu cuenta y completar el registro.",
  };
}

export async function signoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "Ingresa tu correo electrónico registrado." };
  }

  const supabase = await createClient();
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/cuenta`,
  });

  if (error) {
    return { error: "No se pudo enviar el correo de recuperación. Revisa la dirección ingresada." };
  }

  return {
    success: true,
    message: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
  };
}
