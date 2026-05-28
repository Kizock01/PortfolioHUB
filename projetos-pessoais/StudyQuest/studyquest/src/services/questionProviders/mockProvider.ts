import { mockQuestions } from "@/data/mockQuestions";
import type { Question, QuestionFilters } from "@/types/question";

export async function getMockQuestions(filters?: Partial<QuestionFilters>): Promise<Question[]> {
  return filterQuestions(mockQuestions, filters);
}

export function filterQuestions(
  questions: Question[],
  filters?: Partial<QuestionFilters>,
) {
  const filtered = questions.filter((question) => {
    const areaMatch = !filters?.area || filters.area === "all" || question.area === filters.area;
    const subjectMatch = !filters?.subject || filters.subject === "all" || question.subject === filters.subject;
    const topicMatch = !filters?.topic || filters.topic === "all" || question.topic === filters.topic;
    const difficultyMatch =
      !filters?.difficulty || filters.difficulty === "all" || question.difficulty === filters.difficulty;
    const yearMatch = !filters?.year || filters.year === "all" || question.year === filters.year;

    return areaMatch && subjectMatch && topicMatch && difficultyMatch && yearMatch;
  });

  const offset = Math.max(0, filters?.offset ?? 0);
  const limit = Math.max(1, filters?.limit ?? filtered.length);

  return filtered.slice(offset, offset + limit);
}
