import "dotenv/config";
import { createPrismaClient } from "../lib/prisma";
import { getGalleryImageUrls } from "../lib/gallery-images";
import { buildDefaultFavoriteGameSlides } from "../lib/favorite-images";
import { serializeFavoriteGameConfig } from "../lib/chapter2-favorite-game";
import { SEED_IMAGES, TOPIC1_VIDEO, TOPIC1_VIDEO_POSTER } from "../lib/seed-images";

const prisma = createPrismaClient();

/** Set FORCE_SEED=1 to wipe and re-insert milestones, gallery, and dolls. */
const forceReset = process.env.FORCE_SEED === "1";

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    // Do not overwrite admin-edited settings on re-seed.
    update: {},
    create: {
      id: "default",
      partnerName: "My Love",
      yourName: "Yours Truly",
      relationshipStart: new Date("2024-05-20"),
      first520Date: new Date("2025-05-20"),
      heroImageUrl: SEED_IMAGES.hero,
      chapter1ImageUrl: SEED_IMAGES.chapter1,
      chapter1VideoUrl: TOPIC1_VIDEO,
      chapter1VideoPosterUrl: TOPIC1_VIDEO_POSTER,
      chapter2ImageUrl: SEED_IMAGES.chapter2,
      chapter2VideoUrl: null,
      chapter1Copy:
        "Our first 520 felt like opening the first page of a story we didn't know we were writing. Every glance, every laugh — it all meant more than words could hold.",
      chapter2Copy:
        "A year later, the story has grown deeper. We've learned each other's rhythms, celebrated small victories, and built a world that feels unmistakably ours.",
      chapter1PauseCaption:
        "Frozen in time — our first celebration, still glowing.",
      chapter2BonusRedact:
        "and I still fall for you in new ways every week",
      chapter2FilmStripJson: serializeFavoriteGameConfig({
        pickCount: 5,
        curatePrompt: "Choose the frames that were our year.",
        orderPrompt:
          "Drag your five moments into order — one to five.",
        orderHint: "Tap a photo, then tap a slot on mobile.",
        slotLabels: ["One", "Two", "Three", "Four", "Five"],
        slides: (() => {
          const slides = buildDefaultFavoriteGameSlides();
          return slides.length > 0 ? slides : [];
        })(),
      }),
      musicUrl: "/uploads/golden.mp3",
      easterEggStarMessage:
        "Every star in the sky is a moment I fell for you a little more.",
    },
  });

  await prisma.letter.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      content: `My dearest,

On this second 520, I want you to know that loving you is the easiest and most beautiful thing I do every day. You are my calm in chaos, my laughter when the world feels heavy, and my home in every sense of the word.

Thank you for every ordinary moment that became extraordinary because you were there. Thank you for choosing us, again and again.

Here's to every chapter still unwritten — with you, always.

Forever yours,
[Your name]`,
    },
  });

  const quizJson = JSON.stringify([
    {
      question: "Where did we get wonderfully lost on our first adventure?",
      options: ["The mountains", "The coast", "A tiny town with no map"],
      answerIndex: 2,
      wrongReply: "Nice try — think back to our first trip together.",
    },
    {
      question: "What date did our story officially begin?",
      options: ["May 20, 2024", "February 14, 2024", "January 1, 2024"],
      answerIndex: 0,
      wrongReply: "Hint: it's the same day we celebrate every year.",
    },
    {
      question: "What do I whisper when it's just us?",
      options: ["Goodnight", "I love you", "Stay with me"],
      answerIndex: 1,
      wrongReply: "Three little words — you know them by heart.",
    },
  ]);

  const passwordHints = JSON.stringify([
    "Think of the number we celebrate today…",
    "It's our special day — two digits, twice.",
    "forever + 520 — you know this one ♥",
  ]);

  const secretBody =
    "This is our secret corner — a promise that next year, we'll celebrate somewhere new together. Until then, know that you are loved beyond measure.";

  await prisma.secretContent.upsert({
    where: { id: "default" },
    update: {
      envelopeTeaser: "Something I've been saving just for you…",
      quizJson,
      passwordHints,
      body: secretBody,
    },
    create: {
      id: "default",
      title: "A Promise for Year Three",
      body: secretBody,
      mediaUrl: null,
      envelopeTeaser: "Something I've been saving just for you…",
      quizJson,
      passwordHints,
    },
  });

  const milestoneSeeds = [
    {
      date: new Date("2024-05-20"),
      title: "The Beginning",
      description: "The day our story officially began.",
      sortOrder: 0,
    },
    {
      date: new Date("2024-08-14"),
      title: "First Adventure",
      description: "Our first trip together — getting wonderfully lost.",
      sortOrder: 1,
    },
    {
      date: new Date("2024-12-25"),
      title: "Holiday Magic",
      description: "Cozy nights and shared dreams for the new year.",
      sortOrder: 2,
    },
    {
      date: new Date("2025-02-14"),
      title: "Valentine's Day",
      description: "Flowers, dinner, and knowing I'd choose you again.",
      sortOrder: 3,
    },
    {
      date: new Date("2025-05-20"),
      title: "First 520",
      description: "Our first celebration of 520 — I love you.",
      sortOrder: 4,
    },
    {
      date: new Date("2026-01-01"),
      title: "New Year, Same Us",
      description: "Ringing in another year side by side.",
      sortOrder: 5,
    },
    {
      date: new Date("2026-05-20"),
      title: "520 · Year Two",
      description: "Today — celebrating us, again.",
      sortOrder: 6,
    },
  ];

  const milestones = milestoneSeeds.map((m, i) => ({
    ...m,
    imageUrl: SEED_IMAGES.gallery[i % SEED_IMAGES.gallery.length],
  }));

  const milestoneCount = await prisma.milestone.count();
  if (milestoneCount === 0) {
    for (const m of milestones) {
      await prisma.milestone.create({ data: m });
    }
    console.log(`Milestones: seeded ${milestones.length} default entries.`);
  } else if (forceReset) {
    await prisma.milestone.deleteMany();
    for (const m of milestones) {
      await prisma.milestone.create({ data: m });
    }
    console.log(
      `Milestones: FORCE_SEED — reset to ${milestones.length} default entries.`
    );
  } else {
    console.log(
      `Milestones: skipped (${milestoneCount} in DB). Edit via /admin or use FORCE_SEED=1 to reset.`
    );
  }

  const galleryFiles = getGalleryImageUrls();
  const galleryUrls = galleryFiles.map((imageUrl, i) => ({
    imageUrl,
    caption: null,
    sortOrder: i,
    isDecoy: i % 2 === 1,
  }));

  if (galleryUrls.length === 0) {
    console.warn(
      "No images in public/uploads/gallery-images — gallery will be empty until you add files."
    );
  } else {
    console.log(`Gallery: seeding ${galleryUrls.length} images from gallery-images/`);
  }

  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    for (const g of galleryUrls) {
      await prisma.galleryItem.create({ data: g });
    }
    if (galleryUrls.length > 0) {
      console.log(`Gallery: seeded ${galleryUrls.length} items.`);
    }
  } else if (forceReset) {
    await prisma.galleryItem.deleteMany();
    for (const g of galleryUrls) {
      await prisma.galleryItem.create({ data: g });
    }
    console.log(`Gallery: FORCE_SEED — reset to ${galleryUrls.length} items.`);
  } else {
    console.log(
      `Gallery: skipped (${galleryCount} in DB). Use FORCE_SEED=1 to reset.`
    );
  }

  const dollSeeds = [
    {
      name: "Baby One",
      memoryTitle: "The day you chose me",
      memoryStory:
        "This little baby was there when we laughed until the streetlights came on. Every time I see it, I remember how safe I felt beside you.",
      sortOrder: 0,
    },
    {
      name: "Baby Two",
      memoryTitle: "Our first adventure",
      memoryStory:
        "Packed in a bag, carried across cities, this one holds the miles we walked and the photos we still scroll through at midnight.",
      sortOrder: 1,
    },
    {
      name: "Baby Three",
      memoryTitle: "A quiet Sunday",
      memoryStory:
        "Coffee, blankets, and nowhere to be. You tucked this next to me like a promise that ordinary days could be extraordinary.",
      sortOrder: 2,
    },
    {
      name: "Baby Four",
      memoryTitle: "When words weren't enough",
      memoryStory:
        "Some feelings are too big for sentences. You left this on my desk — and I understood everything without a single word.",
      sortOrder: 3,
    },
    {
      name: "Baby Five",
      memoryTitle: "Year two, still us",
      memoryStory:
        "The newest keeper of our story. It sits with the others now, proof that love grows shelf by shelf, memory by memory.",
      sortOrder: 4,
    },
  ];

  const dollCount = await prisma.memoryDoll.count();
  if (dollCount === 0) {
    for (let i = 0; i < dollSeeds.length; i++) {
      await prisma.memoryDoll.create({
        data: {
          ...dollSeeds[i],
          imageUrl: SEED_IMAGES.companions[i] ?? SEED_IMAGES.companions[0],
          memoryDate: null,
        },
      });
    }
    console.log(`Memory dolls: seeded ${dollSeeds.length} entries.`);
  } else if (forceReset) {
    await prisma.memoryDoll.deleteMany();
    for (let i = 0; i < dollSeeds.length; i++) {
      await prisma.memoryDoll.create({
        data: {
          ...dollSeeds[i],
          imageUrl: SEED_IMAGES.companions[i] ?? SEED_IMAGES.companions[0],
          memoryDate: null,
        },
      });
    }
    console.log(`Memory dolls: FORCE_SEED — reset to ${dollSeeds.length} entries.`);
  } else {
    console.log(
      `Memory dolls: skipped (${dollCount} in DB). Use FORCE_SEED=1 to reset.`
    );
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
