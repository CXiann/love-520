import { cookies } from "next/headers";

const SECRET_COOKIE = "love520_secret";
const ADMIN_COOKIE = "love520_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function setSecretSession() {
  const cookieStore = await cookies();
  cookieStore.set(SECRET_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function hasSecretSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SECRET_COOKIE)?.value === "1";
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
