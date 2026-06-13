import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const gallery = await prisma.galleryItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(gallery);
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const count = await prisma.galleryItem.count();

  const item = await prisma.galleryItem.create({
    data: {
      imageUrl: body.imageUrl,
      caption: body.caption ?? null,
      sortOrder: body.sortOrder ?? count,
      isDecoy: Boolean(body.isDecoy),
    },
  });

  return NextResponse.json(item);
}
