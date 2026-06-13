import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const letter = await prisma.letter.findUnique({ where: { id: "default" } });
  return NextResponse.json(letter);
}

export async function PUT(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  const letter = await prisma.letter.update({
    where: { id: "default" },
    data: { content },
  });

  return NextResponse.json(letter);
}
