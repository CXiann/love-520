import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { getFavoriteImageUrls } from "@/lib/favorite-images";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ urls: getFavoriteImageUrls() });
}
