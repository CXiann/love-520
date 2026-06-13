"use client";

import { Section, FadeIn } from "../Section";
import { TimelineQuest } from "../timeline/TimelineQuest";
import type { TimelineMilestoneData } from "../timeline/types";

export function Timeline({
  milestones,
}: {
  milestones: TimelineMilestoneData[];
}) {
  return (
    <Section id="timeline" fullHeight={false}>
      <FadeIn>
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Our Story
        </p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Timeline</h2>
        <p className="mt-4 max-w-xl text-muted">
          Put our memories in order — each frame belongs on the timeline.
        </p>
      </FadeIn>

      <TimelineQuest milestones={milestones} />
    </Section>
  );
}
