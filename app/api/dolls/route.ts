import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dolls = await prisma.memoryDoll.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(dolls);
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const count = await prisma.memoryDoll.count();

  const doll = await prisma.memoryDoll.create({
    data: {
      name: body.name ?? "New baby",
      imageUrl: body.imageUrl,
      memoryTitle: body.memoryTitle ?? "",
      memoryStory: body.memoryStory ?? "",
      memoryDate: body.memoryDate ? new Date(body.memoryDate) : null,
      sortOrder: body.sortOrder ?? count,
    },
  });

  return NextResponse.json(doll);
}
