import type { Metadata } from "next";
import { hasSecretSession } from "@/lib/auth";
import { getSecretContent, getSiteData } from "@/lib/data";
import { SecretClient } from "@/components/SecretClient";

export const metadata: Metadata = {
  title: "A Secret — 520",
  robots: { index: false, follow: false },
};

export default async function SecretPage() {
  const authenticated = await hasSecretSession();
  const [content, { settings }] = await Promise.all([
    getSecretContent(),
    getSiteData(),
  ]);

  const relationshipStart =
    settings?.relationshipStart.toISOString() ?? new Date().toISOString();

  return (
    <SecretClient
      authenticated={authenticated}
      relationshipStart={relationshipStart}
      content={
        content
          ? {
              title: content.title,
              body: content.body,
              mediaUrl: content.mediaUrl,
              envelopeTeaser: content.envelopeTeaser,
              quizJson: content.quizJson,
              passwordHints: content.passwordHints,
            }
          : null
      }
    />
  );
}
