import { getSiteData, getSecretContent } from "@/lib/data";
import { hasSecretSession } from "@/lib/auth";
import { HomeClient } from "@/components/HomeClient";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const [{ settings, milestones, gallery, memoryDolls, letter }, secretContent, secretAuthenticated] =
    await Promise.all([
      getSiteData(),
      getSecretContent(),
      hasSecretSession(),
    ]);

  if (!settings || !letter) {
    notFound();
  }

  const data = {
    settings: {
      partnerName: settings.partnerName,
      yourName: settings.yourName,
      relationshipStart: settings.relationshipStart.toISOString(),
      first520Date: settings.first520Date?.toISOString() ?? null,
      chapter1ImageUrl: settings.chapter1ImageUrl,
      chapter1VideoUrl: settings.chapter1VideoUrl,
      chapter1VideoPosterUrl: settings.chapter1VideoPosterUrl,
      chapter2ImageUrl: settings.chapter2ImageUrl,
      chapter2VideoUrl: settings.chapter2VideoUrl,
      chapter2VideoPosterUrl: settings.chapter2VideoPosterUrl,
      chapter1Copy: settings.chapter1Copy,
      chapter2Copy: settings.chapter2Copy,
      musicUrl: settings.musicUrl || "/uploads/golden.mp3",
      easterEggStarMessage: settings.easterEggStarMessage,
      chapter1HotspotsJson: settings.chapter1HotspotsJson,
      chapter1PauseCaption: settings.chapter1PauseCaption,
      chapter2FilmStripJson: settings.chapter2FilmStripJson,
      chapter2BonusRedact: settings.chapter2BonusRedact,
    },
    milestones: milestones.map((m) => ({
      id: m.id,
      date: m.date.toISOString(),
      title: m.title,
      description: m.description,
      imageUrl: m.imageUrl,
      sortOrder: m.sortOrder,
    })),
    gallery: gallery.map((g) => ({
      id: g.id,
      imageUrl: g.imageUrl,
      caption: g.caption,
      isDecoy: Boolean(g.isDecoy),
    })),
    memoryDolls: memoryDolls.map((d) => ({
      id: d.id,
      name: d.name,
      imageUrl: d.imageUrl,
      memoryTitle: d.memoryTitle,
      memoryStory: d.memoryStory,
      memoryDate: d.memoryDate?.toISOString() ?? null,
      sortOrder: d.sortOrder,
    })),
    letter: { content: letter.content },
    secretContent: secretContent
      ? {
          title: secretContent.title,
          body: secretContent.body,
          mediaUrl: secretContent.mediaUrl,
        }
      : null,
    secretAuthenticated,
  };

  return <HomeClient data={data} />;
}
