import type { Question } from "@/types/question";

export async function getInepQuestions(): Promise<Question[]> {
  throw new Error(
    "Provider INEP preparado para futuro importador de provas e gabaritos oficiais.",
  );
}
