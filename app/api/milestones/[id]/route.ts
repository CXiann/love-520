import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const milestone = await prisma.milestone.update({
    where: { id },
    data: {
      date: new Date(body.date),
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl ?? null,
      sortOrder: body.sortOrder,
    },
  });

  return NextResponse.json(milestone);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.milestone.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
