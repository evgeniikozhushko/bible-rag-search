
import { describe, expect, it } from "vitest";
import { createEmbeddings } from "../openai";
import {
  COLLECTION,
  qdrant,
  SCORE_THRESHOLD,
} from "../qdrant";
import {
  evaluationCases,
  type EvaluationCategory,
  type VerseRange,
} from "./bible-search-cases";
import {
  calculateRetrievalMetrics,
  type RetrievalMetrics,
} from "./retrieval-metrics";

const K = 5;

type SearchPayload = VerseRange & {
  reference: string;
};

type CaseResult = {
  id: string;
  category: EvaluationCategory;
  query: string;
  metrics: RetrievalMetrics;
  references: string[];
};

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function summarize(results: CaseResult[]) {
  return {
    queries: results.length,
    recallAt5: average(
      results.map((result) => result.metrics.recallAtK),
    ),
    mrrAt5: average(
      results.map((result) => result.metrics.mrrAtK),
    ),
    ndcgAt5: average(
      results.map((result) => result.metrics.ndcgAtK),
    ),
  };
}

describe("current dense Bible search baseline", () => {
  it(
    "measures retrieval quality across the evaluation dataset",
    async () => {
      // Embed all 50 queries in one OpenAI request.
      const vectors = await createEmbeddings(
        evaluationCases.map((testCase) => testCase.query),
      );

      // Run all 50 searches against the current Qdrant collection.
      const responses = await qdrant.queryBatch(COLLECTION, {
        searches: vectors.map((vector) => ({
          query: vector,
          limit: K,
          score_threshold: SCORE_THRESHOLD,
          with_payload: true,
        })),
      });

      expect(responses).toHaveLength(evaluationCases.length);

      const caseResults: CaseResult[] = evaluationCases.map(
        (testCase, index) => {
          const points = responses[index].points;

          const payloads = points.map(
            (point) => point.payload as SearchPayload,
          );

          const retrieved: VerseRange[] = payloads.map((payload) => ({
            book: payload.book,
            chapter: payload.chapter,
            verseStart: payload.verseStart,
            verseEnd: payload.verseEnd,
          }));

          return {
            id: testCase.id,
            category: testCase.category,
            query: testCase.query,
            metrics: calculateRetrievalMetrics(
              testCase.relevant,
              retrieved,
              K,
            ),
            references: payloads.map(
              (payload) => payload.reference,
            ),
          };
        },
      );

      const categories: EvaluationCategory[] = [
        "reference",
        "quotation",
        "paraphrase",
        "concept",
        "person-event",
      ];

      const summary = [
        {
          category: "overall",
          ...summarize(caseResults),
        },
        ...categories.map((category) => ({
          category,
          ...summarize(
            caseResults.filter(
              (result) => result.category === category,
            ),
          ),
        })),
      ];

      console.log("\nDense retrieval baseline:");
      console.table(summary);

      const misses = caseResults
        .filter((result) => result.metrics.recallAtK < 1)
        .map((result) => ({
          id: result.id,
          query: result.query,
          recallAt5: result.metrics.recallAtK,
          returned: result.references,
        }));

      console.log(
        "\nQueries without full relevant-range coverage:",
      );
      console.log(JSON.stringify(misses, null, 2));

      expect(caseResults).toHaveLength(50);
    },
    120_000,
  );
});
