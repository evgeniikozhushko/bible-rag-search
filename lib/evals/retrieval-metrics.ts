
import type { VerseRange } from "./bible-search-cases";

export type RetrievalMetrics = {
  recallAtK: number;
  mrrAtK: number;
  ndcgAtK: number;
};

export function rangesOverlap(
  left: VerseRange,
  right: VerseRange,
): boolean {
  return (
    left.book === right.book &&
    left.chapter === right.chapter &&
    left.verseStart <= right.verseEnd &&
    right.verseStart <= left.verseEnd
  );
}

export function calculateRetrievalMetrics(
  relevant: VerseRange[],
  retrieved: VerseRange[],
  k = 5,
): RetrievalMetrics {
  if (relevant.length === 0) {
    return {
      recallAtK: 0,
      mrrAtK: 0,
      ndcgAtK: 0,
    };
  }

  const topResults = retrieved.slice(0, k);

  const coveredRelevantRanges = relevant.filter((expected) =>
    topResults.some((result) => rangesOverlap(expected, result)),
  );

  const recallAtK = coveredRelevantRanges.length / relevant.length;

  const firstRelevantIndex = topResults.findIndex((result) =>
    relevant.some((expected) => rangesOverlap(expected, result)),
  );

  const mrrAtK =
    firstRelevantIndex === -1 ? 0 : 1 / (firstRelevantIndex + 1);

  const creditedRelevantIndexes = new Set<number>();
  let dcg = 0;

  for (let rank = 0; rank < topResults.length; rank++) {
    const result = topResults[rank];

    const matchingRelevantIndex = relevant.findIndex(
      (expected, index) =>
        !creditedRelevantIndexes.has(index) &&
        rangesOverlap(expected, result),
    );

    if (matchingRelevantIndex !== -1) {
      creditedRelevantIndexes.add(matchingRelevantIndex);
      dcg += 1 / Math.log2(rank + 2);
    }
  }

  const idealResultCount = Math.min(relevant.length, k);
  let idealDcg = 0;

  for (let rank = 0; rank < idealResultCount; rank++) {
    idealDcg += 1 / Math.log2(rank + 2);
  }

  return {
    recallAtK,
    mrrAtK,
    ndcgAtK: idealDcg === 0 ? 0 : dcg / idealDcg,
  };
}