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

  const doll = await prisma.memoryDoll.update({
    where: { id },
    data: {
      name: body.name,
      imageUrl: body.imageUrl,
      memoryTitle: body.memoryTitle,
      memoryStory: body.memoryStory,
      memoryDate: body.memoryDate ? new Date(body.memoryDate) : null,
      sortOrder: body.sortOrder,
    },
  });

  return NextResponse.json(doll);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.memoryDoll.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
