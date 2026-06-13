import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const item = await prisma.galleryItem.update({
    where: { id },
    data: {
      ...(body.caption !== undefined ? { caption: body.caption ?? null } : {}),
      ...(body.isDecoy !== undefined ? { isDecoy: Boolean(body.isDecoy) } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.galleryItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
