import { NextResponse } from "next/server";
import { setSecretSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildDynamicSecretPassword } from "@/lib/secret-password";

export async function POST(request: Request) {
  const { password } = await request.json();
  const secretPassword = process.env.SECRET_PASSWORD;

  if (!secretPassword) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { relationshipStart: true },
  });

  const dynamicPassword = settings
    ? buildDynamicSecretPassword(settings.relationshipStart)
    : null;

  const valid =
    password === secretPassword ||
    (dynamicPassword !== null && password === dynamicPassword);

  if (!valid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  await setSecretSession();
  return NextResponse.json({ success: true });
}
