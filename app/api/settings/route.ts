import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import {
  emptyToNull,
  parseOptionalDate,
  parseRequiredDate,
} from "@/lib/parse-date";
import { normalizeMediaUrl } from "@/lib/normalize-media-url";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json(
      { error: "Not signed in. Refresh and log in to admin again." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    for (const [field, label] of [
      ["chapter1HotspotsJson", "Chapter I hotspots JSON"],
    ] as const) {
      const raw = emptyToNull(body[field]);
      if (raw) {
        try {
          JSON.parse(raw);
        } catch {
          return NextResponse.json(
            { error: `${label} must be valid JSON (or leave empty).` },
            { status: 400 }
          );
        }
      }
    }

    const filmRaw = emptyToNull(body.chapter2FilmStripJson);
    if (filmRaw) {
      try {
        const parsed = JSON.parse(filmRaw) as unknown;
        if (Array.isArray(parsed)) {
          /* legacy slide array */
        } else if (parsed && typeof parsed === "object") {
          const o = parsed as Record<string, unknown>;
          if (o.slides !== undefined && !Array.isArray(o.slides)) {
            return NextResponse.json(
              {
                error:
                  "Favorite moments game: slides must be an array (or use the admin editor).",
              },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            {
              error:
                "Favorite moments game must be valid JSON (slide array or game object).",
            },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            error:
              "Favorite moments game must be valid JSON (or leave empty).",
          },
          { status: 400 }
        );
      }
    }

    const settings = await prisma.siteSettings.update({
      where: { id: "default" },
      data: {
        partnerName: String(body.partnerName ?? "").trim() || "My Love",
        yourName: String(body.yourName ?? "").trim() || "Yours Truly",
        relationshipStart: parseRequiredDate(
          body.relationshipStart,
          "Relationship start date"
        ),
        first520Date: parseOptionalDate(body.first520Date),
        heroImageUrl: emptyToNull(body.heroImageUrl),
        chapter1ImageUrl: emptyToNull(body.chapter1ImageUrl),
        chapter1VideoUrl: normalizeMediaUrl(body.chapter1VideoUrl),
        chapter1VideoPosterUrl: normalizeMediaUrl(body.chapter1VideoPosterUrl),
        chapter2ImageUrl: emptyToNull(body.chapter2ImageUrl),
        chapter2VideoUrl: normalizeMediaUrl(body.chapter2VideoUrl),
        chapter2VideoPosterUrl: normalizeMediaUrl(body.chapter2VideoPosterUrl),
        chapter1Copy: emptyToNull(body.chapter1Copy),
        chapter2Copy: emptyToNull(body.chapter2Copy),
        musicUrl: emptyToNull(body.musicUrl),
        easterEggStarMessage: emptyToNull(body.easterEggStarMessage),
        chapter1HotspotsJson: emptyToNull(body.chapter1HotspotsJson),
        chapter1PauseCaption: emptyToNull(body.chapter1PauseCaption),
        chapter2FilmStripJson: emptyToNull(body.chapter2FilmStripJson),
        chapter2BonusRedact: emptyToNull(body.chapter2BonusRedact),
      },
    });

    return NextResponse.json(settings);
  } catch (err) {
    let message =
      err instanceof Error ? err.message : "Could not save settings";
    if (message.includes("Unknown argument") && message.includes("chapter1")) {
      message =
        "Database client is out of date. Stop the dev server, run `npx prisma generate`, then start again with `npm run dev`.";
    }
    console.error("[settings PUT]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
