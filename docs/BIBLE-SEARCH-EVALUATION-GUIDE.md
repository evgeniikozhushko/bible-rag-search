---
title: Evaluating Bible Semantic Search
status: learning-guide
created: 2026-10-21
tags:
  - bible-search
  - semantic-search
  - retrieval-evaluation
  - recall
  - mrr
  - ndcg
  - qdrant
  - vitest
---

# Evaluating Bible Semantic Search

This guide explains how we established a measurable baseline for the Bible semantic-search application. It is intended both as a learning reference and as a short walkthrough that can be shared with other students.

## Why establish a baseline?

The application converts a query into an OpenAI embedding and searches Bible chunks stored in Qdrant. Looking at a few searches manually can tell us whether the application appears to work, but it cannot reliably tell us whether a later change made retrieval better or worse.

A baseline gives us a fixed benchmark:

1. Run the same queries through the current search pipeline.
2. Compare the returned passages with passages selected in advance.
3. Calculate standard retrieval metrics.
4. Save the results before changing the search implementation.

When hybrid search or reranking is added later, it can be evaluated against the same cases.

## Evaluation flow

```text
50 fixed queries
      │
      ▼
OpenAI embeddings
      │
      ▼
Current dense Qdrant search
      │
      ▼
Top five chunks per query
      │
      ▼
Compare with expected verse ranges
      │
      ▼
Recall@5, MRR@5, and nDCG@5
```

The evaluation is read-only: it searches the existing collection but does not change the index.

## 1. The evaluation dataset

The dataset lives in [`lib/evals/bible-search-cases.ts`](../lib/evals/bible-search-cases.ts).

Each case has a unique ID, a query category, the user's query, and one or more acceptable scripture ranges:

```ts
export type EvaluationCase = {
  id: string;
  category: EvaluationCategory;
  query: string;
  relevant: VerseRange[];
};
```

For example:

```ts
{
  id: "paraphrase-06",
  category: "paraphrase",
  query: "Trust God instead of relying entirely on your own understanding",
  relevant: [
    { book: "Proverbs", chapter: 3, verseStart: 5, verseEnd: 6 },
  ],
}
```

The expected answer is stored as structured data instead of a string such as `Proverbs 3:5-6`. Structured ranges are easier and safer to compare with Qdrant payloads.

### Query categories

The dataset contains 50 cases, with 10 in each category:

| Category | What it tests | Example |
| --- | --- | --- |
| `reference` | Direct scripture references and aliases | `Jn 3:16` |
| `quotation` | Wording close to the KJV text | `The Lord is my shepherd` |
| `paraphrase` | The same meaning in different words | `Do not worry about tomorrow` |
| `concept` | Broad thematic searches | `dealing with anxiety and worry` |
| `person-event` | Descriptions of biblical people or events | `Daniel survives the lions' den` |

Separating categories shows where the system is strong or weak. A single overall score could otherwise conceal poor performance on one kind of query.

### Dataset validation

[`lib/evals/bible-search-cases.test.ts`](../lib/evals/bible-search-cases.test.ts) verifies that:

- there are exactly 50 cases;
- each category contains 10 cases;
- IDs and normalized queries are unique;
- every case contains at least one valid verse range.

These checks catch accidental dataset mistakes before a paid live evaluation runs.

## 2. Matching chunks to expected passages

The metric code lives in [`lib/evals/retrieval-metrics.ts`](../lib/evals/retrieval-metrics.ts).

Qdrant returns five-verse chunks, while an expected answer may be a single verse. Exact equality would therefore mark a correct chunk as wrong. Instead, two ranges are relevant when they belong to the same book and chapter and their verses overlap:

```ts
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
```

For example, expected verse `John 3:16` overlaps retrieved chunk `John 3:13-17`, so it counts as relevant.

## 3. Retrieval metrics

All metrics are calculated over the first five results, which is why their names end with `@5`.

### Recall@5

Recall measures how much of the expected set was found:

```text
covered expected ranges / total expected ranges
```

If a query has two accepted passages and the top five results contain one, Recall@5 is `0.5`. If both are covered, it is `1.0`.

### MRR@5

Mean Reciprocal Rank measures how early the first relevant result appears:

| First relevant result | Reciprocal rank |
| --- | ---: |
| Rank 1 | 1.00 |
| Rank 2 | 0.50 |
| Rank 3 | 0.33 |
| No relevant result | 0.00 |

The score is calculated per query and then averaged across all queries. MRR is useful when users usually choose the first promising result.

### nDCG@5

Normalized Discounted Cumulative Gain rewards relevant results near the top while still giving some credit to relevant results lower down. The implementation also prevents two overlapping chunks from receiving duplicate credit for the same expected range.

An nDCG score of `1.0` means the known relevant results appeared in the ideal order. A lower score means relevant results were missing, appeared later, or were duplicated by overlapping chunks.

### Metric unit tests

[`lib/evals/retrieval-metrics.test.ts`](../lib/evals/retrieval-metrics.test.ts) covers:

- exact and partial range overlap;
- different chapters and adjacent non-overlapping verses;
- a relevant result at rank one or rank two;
- multiple accepted passages;
- duplicate overlapping chunks;
- no relevant result;
- relevant results beyond the `k` cutoff.

These are local unit tests and do not call OpenAI or Qdrant.

## 4. The live baseline test

The live evaluation is in [`lib/evals/bible-search-baseline.test.ts`](../lib/evals/bible-search-baseline.test.ts).

It performs four main operations.

### Embed all queries

```ts
const vectors = await createEmbeddings(
  evaluationCases.map((testCase) => testCase.query),
);
```

All 50 queries are embedded in one OpenAI request. Batching reduces network overhead while using the same embedding model as production search.

### Search Qdrant in a batch

```ts
const responses = await qdrant.queryBatch(COLLECTION, {
  searches: vectors.map((vector) => ({
    query: vector,
    limit: 5,
    score_threshold: SCORE_THRESHOLD,
    with_payload: true,
  })),
});
```

This intentionally uses the current collection, score threshold, and result limit. A baseline must measure the application as it exists before improvements are introduced.

### Calculate per-query metrics

The returned payload metadata is converted into `VerseRange` objects and compared with each case's expected ranges:

```ts
metrics: calculateRetrievalMetrics(
  testCase.relevant,
  retrieved,
  5,
),
```

### Summarize results

The test averages the metrics overall and within each category. It also prints queries with incomplete expected-range coverage so they can be reviewed manually.

The test verifies that all 50 cases ran, but it does not fail because a quality score is low. Its purpose is to record the current system's behavior. Later evaluations can add explicit regression gates after the benchmark is finalized.

## 5. Baseline results

The provisional dense-search baseline was:

| Category | Recall@5 | MRR@5 | nDCG@5 |
| --- | ---: | ---: | ---: |
| Overall | 0.8200 | 0.6803 | 0.7073 |
| Reference | 0.8000 | 0.5033 | 0.5780 |
| Quotation | 1.0000 | 0.8833 | 0.9131 |
| Paraphrase | 0.9000 | 0.7750 | 0.8062 |
| Concept | 0.4000 | 0.3200 | 0.3007 |
| Person/event | 1.0000 | 0.9200 | 0.9387 |

### Interpretation

- **Quotations and person/event descriptions are strong.** Dense embeddings handle wording and narrative descriptions well.
- **Paraphrases are also strong.** This demonstrates the main benefit of semantic search over exact keyword matching.
- **References rank poorly.** A query such as `1 John 4:7-8` should eventually use deterministic reference parsing rather than semantic similarity.
- **Broad concepts score lowest.** Some returned passages are genuinely relevant but are missing from the manually selected expected ranges.

The concept scores are therefore provisional. Broad topics can have many valid passages, making complete human ground truth difficult. Relevant returned passages should be reviewed before the benchmark is frozen, without changing judgments merely to make the current system look better.

## 6. Running the evaluation

### Prerequisites

- `OPENAI_API_KEY` is configured in `.env`.
- Docker Desktop is running.
- Qdrant is running and contains the `bible` collection.

Start Qdrant:

```bash
docker compose up -d
```

Verify the collection:

```bash
curl http://localhost:6333/collections/bible
```

The collection should report `7924` points. If it is missing, rebuild the derived index:

```bash
npm run bible:index
```

Run all evaluation tests:

```bash
npm run test:evals
```

The command runs the dataset tests, metric tests, and live baseline test. The live test makes a real OpenAI embedding request.

## 7. Troubleshooting learned during implementation

### `ECONNREFUSED` on port 6333

Qdrant is not running. Start Docker Desktop, then run:

```bash
docker compose up -d
```

### Qdrant exits with code 135 or a bus error

Qdrant's memory-mapped storage can be unreliable with a macOS bind-mounted directory. The project now uses a Docker-managed named volume:

```yaml
services:
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  qdrant_data:
```

The Bible index is derived data, so it can be rebuilt from the generated chunks when needed.

### Vite native config warning

The current test command may print a warning about ESM syntax in `vitest.config.ts`. It does not affect these evaluation results. Test failures and connectivity errors should still be addressed normally.

## 8. Key lessons

1. **Evaluate before optimizing.** Without a baseline, an improvement is only an opinion.
2. **Use multiple query categories.** Different retrieval weaknesses require different fixes.
3. **Keep ground truth separate from search output.** Expected answers should be selected before tuning the system.
4. **Match at the data's natural granularity.** Verse-range overlap is more appropriate than string equality for chunk retrieval.
5. **Test the evaluator itself.** Incorrect metrics can be more misleading than having no metrics.
6. **Inspect failures manually.** A low score may reveal either a retrieval problem or incomplete relevance judgments.
7. **Keep the benchmark fixed after review.** Future dense, hybrid, and reranked systems must be compared on the same cases.

## Related files

- [`docs/BIBLE-SEARCH-QUALITY-ROADMAP.md`](./BIBLE-SEARCH-QUALITY-ROADMAP.md) — planned retrieval improvements and execution log.
- [`lib/evals/bible-search-cases.ts`](../lib/evals/bible-search-cases.ts) — queries and expected passages.
- [`lib/evals/retrieval-metrics.ts`](../lib/evals/retrieval-metrics.ts) — metric implementation.
- [`lib/evals/bible-search-baseline.test.ts`](../lib/evals/bible-search-baseline.test.ts) — live evaluation runner.
- [`lib/evals/bible-search-cases.test.ts`](../lib/evals/bible-search-cases.test.ts) — dataset validation.
- [`lib/evals/retrieval-metrics.test.ts`](../lib/evals/retrieval-metrics.test.ts) — metric unit tests.

Next Oct 21, 2026

The next app improvement should be deterministic scripture-reference lookup.

Currently, queries like John 3:16 are embedded and searched semantically. That caused relatively weak reference results:

- Recall@5: 0.80
- MRR@5: 0.50

Instead, the app should:

1. Recognize references such as John 3:16, Jn 3:16, or 1 John 4:7-8.
2. Normalize book aliases to canonical names.
3. Retrieve the requested verses directly.
4. Skip OpenAI embeddings for reference searches.

This would provide exact results, reduce latency and API cost, and target a clearly measured weakness.

Before measuring the improvement, we should also review the broad concept judgments so the baseline is no longer marked provisional. After that, deterministic reference lookup is the best next coding task.
