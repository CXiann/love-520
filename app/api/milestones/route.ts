import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const milestones = await prisma.milestone.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(milestones);
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const count = await prisma.milestone.count();

  const milestone = await prisma.milestone.create({
    data: {
      date: new Date(body.date),
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl ?? null,
      sortOrder: body.sortOrder ?? count,
    },
  });

  return NextResponse.json(milestone);
}
