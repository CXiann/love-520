export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  wrongReply: string;
};

export type SecretStage = "envelope" | "quiz" | "reveal";

export const SECRET_STAGE_KEY = "love520_secret_stage";

export function parseQuizJson(json: string | null | undefined): QuizQuestion[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as QuizQuestion[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.answerIndex === "number"
    );
  } catch {
    return [];
  }
}

export function parsePasswordHints(
  json: string | null | undefined
): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as string[];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}
