import type { Question } from "@/types/question";

export async function getVestibularQuestions(): Promise<Question[]> {
  throw new Error(
    "Provider de vestibulares preparado para FUVEST, UNICAMP, UNESP e universidades publicas.",
  );
}
