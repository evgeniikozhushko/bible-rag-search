import { describe, expect, it } from "vitest";
import {
  evaluationCases,
  type EvaluationCategory,
} from "./bible-search-cases";

const categories: EvaluationCategory[] = [
  "reference",
  "quotation",
  "paraphrase",
  "concept",
  "person-event",
];

describe("Bible search evaluation cases", () => {
  it("contains exactly 50 cases", () => {
    expect(evaluationCases).toHaveLength(50);
  });

  it("contains 10 cases in every category", () => {
    for (const category of categories) {
      const casesInCategory = evaluationCases.filter(
        (testCase) => testCase.category === category,
      );

      expect(casesInCategory, category).toHaveLength(10);
    }
  });

  it("uses unique IDs and queries", () => {
    const ids = evaluationCases.map((testCase) => testCase.id);
    const queries = evaluationCases.map((testCase) =>
      testCase.query.trim().toLowerCase(),
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(queries).size).toBe(queries.length);
  });

  it("gives every case at least one valid relevant range", () => {
    for (const testCase of evaluationCases) {
      expect(testCase.relevant.length, testCase.id).toBeGreaterThan(0);

      for (const range of testCase.relevant) {
        expect(range.book.length, testCase.id).toBeGreaterThan(0);
        expect(range.chapter, testCase.id).toBeGreaterThan(0);
        expect(range.verseStart, testCase.id).toBeGreaterThan(0);
        expect(range.verseEnd, testCase.id).toBeGreaterThanOrEqual(
          range.verseStart,
        );
      }
    }
  });
});