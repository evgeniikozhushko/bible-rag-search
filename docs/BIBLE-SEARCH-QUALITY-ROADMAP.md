---
title: Bible Search Quality Roadmap
status: in-progress
created: 2026-10-21
tags:
  - bible-search
  - qdrant
  - hybrid-search
  - semantic-search
  - sparse-vectors
  - reranking
  - retrieval-evaluation
---

# Bible Search Quality Roadmap

## Goal

Improve passage retrieval by adding measurable evaluation, deterministic scripture-reference lookup, hybrid semantic and lexical search, overlap deduplication, and reranking.

The application will remain a passage-search tool during this iteration. Generated theological explanations and conversational answers are not part of this work.

## Current State

- The search route embeds a query with OpenAI's `text-embedding-3-small` model.
- Qdrant performs dense-vector retrieval from five-verse chunks with one verse of overlap.
- A fixed score threshold filters results before the API returns them.
- Queries that are already scripture references still go through semantic search.
- Results expose raw similarity scores even though those scores are not meaningful to most users.
- There is no automated retrieval-quality dataset or baseline.

## Success Criteria

- Valid scripture-reference queries have a 100% exact-hit rate.
- The new pipeline improves MRR@5 by at least 10% relative to the recorded dense-search baseline.
- Overall Recall@5 does not regress.
- No evaluation category regresses by more than 10 percentage points.
- Invalid requests and malformed reference-shaped queries produce useful 400 responses.
- Reranking failures fall back to fused retrieval rather than failing the search.
- Type checking and the production build pass before release.

## Implementation Checklist

### 1. Establish the evaluation baseline

- [ ] Create a 50-query evaluation dataset with 10 queries in each category: exact references, quotations, paraphrases, concepts, and names or events.
- [ ] Allow each query to identify one or more acceptable scripture ranges.
- [ ] Measure the current dense pipeline with Recall@5, MRR@5, and nDCG@5.
- [ ] Record the baseline metrics in the execution log below before changing retrieval behavior.

### 2. Add deterministic reference lookup

- [ ] Store individual `{ verse, text }` entries in each chunk payload so exact passages can be reconstructed without parsing concatenated text.
- [ ] Parse single-chapter references such as `John 3:16`, `Jn 3:16`, and `1 John 4:7-12`.
- [ ] Normalize book aliases, case, punctuation, and whitespace.
- [ ] Bypass embedding and reranking when the query is a valid scripture reference.
- [ ] Return a 400 response when a query clearly has reference syntax but names a nonexistent book, chapter, verse, or reversed range.

### 3. Add hybrid retrieval

- [ ] Replace the unnamed vector with a named `dense` vector using the current OpenAI embedding configuration.
- [ ] Add a named `lexical` sparse vector using normalized unigram tokens and stable integer token hashing.
- [ ] Use BM25-style term-frequency weights and Qdrant's IDF modifier for sparse-vector scoring.
- [ ] Retrieve 20 dense candidates and 20 lexical candidates.
- [ ] Combine candidates with Qdrant reciprocal-rank fusion.
- [ ] Suppress duplicate or overlapping passage windows before reranking.

### 4. Rerank candidates

- [ ] Rerank up to 20 fused candidates with `gpt-4o-mini`.
- [ ] Use `openai.responses.parse()` with `zodTextFormat()` and a Zod schema.
- [ ] Require the model to return candidate IDs with `high`, `medium`, `low`, or `irrelevant` relevance.
- [ ] Reject unknown or duplicate candidate IDs during validation.
- [ ] Remove irrelevant candidates and retain fused order when candidates receive the same relevance grade.
- [ ] Fall back to fused retrieval if the reranker call fails or its parsed output is invalid.

### 5. Update the API and interface

- [ ] Preserve the request body `{ query: string, k?: number }`, with `k` defaulting to 5 and constrained to 1–50.
- [ ] Return the search mode and human-readable relevance instead of raw similarity scores.
- [ ] Update the results UI to display relevance labels.
- [ ] Keep the existing empty, loading, and error states.
- [ ] Remove the duplicate `setSearched(false)` call.
- [ ] Correct the image alt text, stale medical metadata, and stale package name.
- [ ] Document required environment variables and the new indexing workflow.

### 6. Index and release safely

- [ ] Build the new index in a versioned `bible_v2` collection.
- [ ] Expose the active version through a `bible_search` Qdrant alias.
- [ ] Verify collection dimensions, vector names, point count, and representative searches before promotion.
- [ ] Move the alias to `bible_v2` only after all acceptance gates pass.
- [ ] Retain the existing collection until the new version has been validated and rollback is no longer required.

## API Contract

The request contract remains:

```ts
type SearchRequest = {
  query: string;
  k?: number;
};
```

The response becomes:

```ts
type SearchResult = {
  reference: string;
  text: string;
  relevance: "high" | "medium" | "low";
};

type SearchResponse = {
  mode: "exact-reference" | "hybrid";
  results: SearchResult[];
};
```

Error behavior:

- `400`: invalid JSON, invalid request shape, or an invalid reference-shaped query.
- `503`: an embedding or Qdrant dependency is unavailable.
- `500`: an unexpected internal failure.
- A reranker failure is not an API failure; the route returns fused results.

## Testing and Evaluation

### Unit tests

- Book aliases, numbered books, capitalization, punctuation, and whitespace.
- Single verses, verse ranges, reversed ranges, and nonexistent references.
- Stable token hashing and deterministic sparse-vector generation.
- Candidate fusion, overlap removal, reranker validation, and fallback ordering.

### Integration tests

- Exact-reference lookup does not call the embedding or reranking models.
- Hybrid searches construct both dense and sparse Qdrant queries.
- The requested `k` is respected after filtering and reranking.
- Empty results are returned successfully.
- Reranker failures return reciprocal-rank-fusion results.
- Validation, Qdrant, embedding, and unexpected failures map to the documented status codes.

### Live evaluation and release gates

- Run live retrieval evaluations only when `RUN_EVALS=1`.
- Compare the new metrics with the recorded baseline and the success criteria above.
- Run `npx tsc --noEmit`.
- Run the automated test suite.
- Run a production build.

## Rollout and Rollback

1. Record baseline metrics against the current collection.
2. Build and validate `bible_v2` without altering the existing collection.
3. Run the complete evaluation suite against `bible_v2`.
4. Point the `bible_search` alias at `bible_v2` after acceptance.
5. If production checks fail, point the alias back to the previous collection.
6. Remove the old collection only in a separate, explicitly approved cleanup after the rollback window.

## Assumptions and Non-goals

- The King James Version remains the only translation.
- The five-verse chunk size and one-verse overlap remain unchanged so this iteration isolates retrieval changes from chunking changes.
- A second model call for reranking is acceptable for non-reference searches.
- Exact-reference searches incur no embedding or reranking call.
- The feature returns source passages, not generated interpretations or conversational answers.
- The existing Qdrant collection remains recoverable throughout rollout.

## Execution Log

Update the frontmatter status to `in-progress` when implementation begins and to `completed` only after every acceptance gate passes.

| Date | Status | Change or decision | Metrics / evidence | Blockers or follow-up |
| --- | --- | --- | --- | --- |
| 2026-10-21 | Planned | Roadmap created | Current TypeScript check passes; retrieval baseline not yet recorded | Build the evaluation dataset before changing retrieval |


| 2026-10-21 | Baseline measured—provisional | Ran dense-only retrieval over 50 queries with `k=5` and threshold `0.3` | Overall: Recall@5 0.8200, MRR@5 0.6803, nDCG@5 0.7073. Reference: 0.8000/0.5033/0.5780. Quotation: 1.0000/0.8833/0.9131. Paraphrase: 0.9000/0.7750/0.8062. Concept: 0.4000/0.3200/0.3007. Person/event: 1.0000/0.9200/0.9387. | Review concept judgments before freezing the benchmark because several returned passages appear relevant but are not currently accepted. |