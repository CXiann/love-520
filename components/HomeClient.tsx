"use client";

import { SmoothScroll } from "./SmoothScroll";
import { FilmProgress } from "./FilmProgress";
import { MusicToggle } from "./MusicToggle";
import { HeartCollector } from "./HeartCollector";
import { Opening } from "./sections/Opening";
import { ChapterSection } from "./chapters/ChapterSection";
import { Timeline } from "./sections/Timeline";
import { DollShelf } from "./sections/DollShelf";
import { Gallery } from "./sections/Gallery";
import { Letter } from "./sections/Letter";
import { Finale } from "./sections/Finale";
import { EasterEggProvider } from "./easter-eggs/EasterEggProvider";

export type HomeData = {
  settings: {
    partnerName: string;
    yourName: string;
    relationshipStart: string;
    first520Date: string | null;
    chapter1ImageUrl: string | null;
    chapter1VideoUrl: string | null;
    chapter1VideoPosterUrl: string | null;
    chapter2ImageUrl: string | null;
    chapter2VideoUrl: string | null;
    chapter2VideoPosterUrl: string | null;
    chapter1Copy: string | null;
    chapter2Copy: string | null;
    musicUrl: string | null;
    easterEggStarMessage: string | null;
    chapter1HotspotsJson: string | null;
    chapter1PauseCaption: string | null;
    chapter2FilmStripJson: string | null;
    chapter2BonusRedact: string | null;
  };
  milestones: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    imageUrl: string | null;
    sortOrder: number;
  }>;
  gallery: Array<{
    id: string;
    imageUrl: string;
    caption: string | null;
    isDecoy: boolean;
  }>;
  memoryDolls: Array<{
    id: string;
    name: string;
    imageUrl: string;
    memoryTitle: string;
    memoryStory: string;
    memoryDate: string | null;
    sortOrder: number;
  }>;
  letter: { content: string };
  secretContent: {
    title: string;
    body: string;
    mediaUrl: string | null;
  } | null;
  secretAuthenticated: boolean;
};

export function HomeClient({ data }: { data: HomeData }) {
  const {
    settings,
    milestones,
    gallery,
    memoryDolls,
    letter,
    secretContent,
    secretAuthenticated,
  } = data;

  const starMessage =
    settings.easterEggStarMessage ??
    settings.chapter1Copy?.slice(0, 120) ??
    "Every star is a moment I fell for you.";

  return (
    <EasterEggProvider>
      <SmoothScroll>
        <FilmProgress />
        <MusicToggle musicUrl={settings.musicUrl} />
        <main className="snap-container">
          <Opening
            partnerName={settings.partnerName}
            starMessage={starMessage}
          />
          <HeartCollector />
          <ChapterSection
            id="chapter1"
            topicLabel="The beginning"
            title="Our first 520"
            copy={
              settings.chapter1Copy ??
              "Our first 520 — the beginning of a beautiful tradition."
            }
            imageUrl={settings.chapter1ImageUrl}
            videoUrl={settings.chapter1VideoUrl}
            videoPosterUrl={settings.chapter1VideoPosterUrl}
          />
          <ChapterSection
            id="chapter2"
            topicLabel="This year"
            title="This Year"
            copy={
              settings.chapter2Copy ??
              "Another year of growing closer, laughing louder, loving deeper."
            }
            imageUrl={settings.chapter2ImageUrl}
            videoUrl={settings.chapter2VideoUrl}
            videoPosterUrl={
              settings.chapter2VideoPosterUrl ?? settings.chapter2ImageUrl
            }
            warm
            chapter2FilmStripJson={settings.chapter2FilmStripJson}
            partnerName={settings.partnerName}
            yourName={settings.yourName}
          />
          <Timeline milestones={milestones} />
          <DollShelf
            dolls={memoryDolls}
            relationshipStart={settings.relationshipStart}
          />
          <Gallery items={gallery} />
          <Letter content={letter.content} yourName={settings.yourName} />
          <Finale
            relationshipStart={settings.relationshipStart}
            first520Date={settings.first520Date}
            partnerName={settings.partnerName}
            secretContent={secretContent}
            secretAuthenticated={secretAuthenticated}
          />
        </main>
      </SmoothScroll>
    </EasterEggProvider>
  );
}
