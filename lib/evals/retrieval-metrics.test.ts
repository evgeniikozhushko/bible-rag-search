import { describe, expect, it } from "vitest";
import type { VerseRange } from "./bible-search-cases";
import {
  calculateRetrievalMetrics,
  rangesOverlap,
} from "./retrieval-metrics";

const john316: VerseRange = {
  book: "John",
  chapter: 3,
  verseStart: 16,
  verseEnd: 16,
};

describe("rangesOverlap", () => {
  it("matches an exact verse", () => {
    expect(rangesOverlap(john316, john316)).toBe(true);
  });

  it("matches a verse inside a larger chunk", () => {
    const chunk: VerseRange = {
      book: "John",
      chapter: 3,
      verseStart: 13,
      verseEnd: 17,
    };

    expect(rangesOverlap(john316, chunk)).toBe(true);
  });

  it("does not match a different chapter", () => {
    const otherChapter: VerseRange = {
      book: "John",
      chapter: 4,
      verseStart: 16,
      verseEnd: 16,
    };

    expect(rangesOverlap(john316, otherChapter)).toBe(false);
  });

  it("does not match adjacent ranges", () => {
    const nextVerse: VerseRange = {
      book: "John",
      chapter: 3,
      verseStart: 17,
      verseEnd: 17,
    };

    expect(rangesOverlap(john316, nextVerse)).toBe(false);
  });
});

describe("calculateRetrievalMetrics", () => {
  it("gives full credit when the first result is relevant", () => {
    const metrics = calculateRetrievalMetrics([john316], [john316]);

    expect(metrics).toEqual({
      recallAtK: 1,
      mrrAtK: 1,
      ndcgAtK: 1,
    });
  });

  it("discounts a relevant result appearing at rank two", () => {
    const irrelevant: VerseRange = {
      book: "Genesis",
      chapter: 1,
      verseStart: 1,
      verseEnd: 5,
    };

    const metrics = calculateRetrievalMetrics(
      [john316],
      [irrelevant, john316],
    );

    expect(metrics.recallAtK).toBe(1);
    expect(metrics.mrrAtK).toBe(0.5);
    expect(metrics.ndcgAtK).toBeCloseTo(1 / Math.log2(3));
  });

  it("measures coverage of multiple relevant ranges", () => {
    const james15: VerseRange = {
      book: "James",
      chapter: 1,
      verseStart: 5,
      verseEnd: 5,
    };

    const metrics = calculateRetrievalMetrics(
      [john316, james15],
      [john316, james15],
    );

    expect(metrics.recallAtK).toBe(1);
    expect(metrics.mrrAtK).toBe(1);
    expect(metrics.ndcgAtK).toBe(1);
  });

  it("does not give duplicate credit for overlapping chunks", () => {
    const secondRelevant: VerseRange = {
      book: "James",
      chapter: 1,
      verseStart: 5,
      verseEnd: 5,
    };

    const duplicateChunk: VerseRange = {
      book: "John",
      chapter: 3,
      verseStart: 15,
      verseEnd: 19,
    };

    const metrics = calculateRetrievalMetrics(
      [john316, secondRelevant],
      [john316, duplicateChunk, secondRelevant],
    );

    expect(metrics.recallAtK).toBe(1);
    expect(metrics.mrrAtK).toBe(1);
    expect(metrics.ndcgAtK).toBeLessThan(1);
  });

  it("returns zero when nothing relevant is retrieved", () => {
    const irrelevant: VerseRange = {
      book: "Romans",
      chapter: 8,
      verseStart: 1,
      verseEnd: 5,
    };

    const metrics = calculateRetrievalMetrics([john316], [irrelevant]);

    expect(metrics).toEqual({
      recallAtK: 0,
      mrrAtK: 0,
      ndcgAtK: 0,
    });
  });

  it("ignores relevant results beyond k", () => {
    const irrelevant: VerseRange = {
      book: "Genesis",
      chapter: 1,
      verseStart: 1,
      verseEnd: 5,
    };

    const metrics = calculateRetrievalMetrics(
      [john316],
      [
        irrelevant,
        irrelevant,
        irrelevant,
        irrelevant,
        irrelevant,
        john316,
      ],
      5,
    );

    expect(metrics).toEqual({
      recallAtK: 0,
      mrrAtK: 0,
      ndcgAtK: 0,
    });
  });
});