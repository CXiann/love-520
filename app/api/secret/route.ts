import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const secret = await prisma.secretContent.findUnique({
    where: { id: "default" },
  });
  return NextResponse.json(secret);
}

export async function PUT(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const secret = await prisma.secretContent.update({
    where: { id: "default" },
    data: {
      title: body.title,
      body: body.body,
      mediaUrl: body.mediaUrl ?? null,
      envelopeTeaser: body.envelopeTeaser ?? null,
      quizJson: body.quizJson ?? null,
      passwordHints: body.passwordHints ?? null,
    },
  });

  return NextResponse.json(secret);
}
