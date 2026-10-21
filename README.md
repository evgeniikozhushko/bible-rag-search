# Bible RAG Search

An evaluation-driven semantic retrieval system for the complete King James Bible. It transforms natural-language questions, paraphrases, quotations, people, and events into ranked scripture passages—without requiring the user to know the exact wording or reference.

This project focuses on the retrieval layer of RAG: building high-quality, traceable context for a downstream answer model rather than generating theological interpretations.

## What makes it useful

- **Meaning-based search** — finds relevant passages when the query and scripture use different words.
- **Complete KJV corpus** — 31,102 verses organized into 7,924 searchable passage windows.
- **Grounded results** — every result includes its canonical scripture reference and original text.
- **Context-preserving chunks** — passages contain enough surrounding verses to preserve meaning.
- **Noise control** — a similarity threshold removes weak matches before they reach the user or a generation step.
- **Measured retrieval quality** — a 50-query benchmark evaluates the system across five realistic search categories.

## RAG pipeline

```text
KJV text
   ↓ parse into structured verses
Chapter-aware sliding windows
   ↓ embed reference + passage text
OpenAI text-embedding-3-small (1,536 dimensions)
   ↓ index with metadata
Qdrant cosine-vector collection
   ↓ query embedding + top-k similarity search
Ranked, citation-ready scripture passages
```

The returned passages are suitable as grounded context for an LLM, while remaining independently useful as a semantic scripture search experience.

## Retrieval techniques

### Chapter-bounded sliding-window chunking

The corpus is split into five-verse windows with a stride of four, producing one verse of overlap between neighboring chunks. Windows never cross chapter boundaries.

This design balances three competing needs:

- single verses are often too short to encode the full thought;
- whole chapters can dilute the semantic signal;
- overlap protects ideas that span a chunk boundary.

Each chunk stores structured metadata—book, chapter, starting verse, ending verse, reference, and text—so retrieval stays traceable and results can be evaluated at verse-range granularity.

### Reference-aware embeddings

The embedded representation combines the canonical reference with the passage text:

```text
1 Corinthians 13:1-5 — Though I speak with the tongues of men and of angels...
```

Including both semantic content and location gives the vector useful textual context while preserving a direct connection to the source passage.

### Batched vector indexing

Chunks are embedded in batches and stored as Qdrant points with their scripture metadata. The index uses 1,536-dimensional OpenAI embeddings and cosine distance, keeping the retrieval path compact and scalable.

### Thresholded top-k retrieval

Each query is embedded with the same model used for the corpus. Qdrant ranks the nearest passage vectors, applies a minimum similarity threshold, and returns only the requested top results. This prevents the system from presenting a forced answer when no passage is sufficiently relevant.

## Evaluation-first quality

Retrieval quality is measured with a fixed 50-query dataset covering:

| Query category | What it tests | Example intent |
| --- | --- | --- |
| Exact reference | Location lookup through the semantic pipeline | `John 3:16` |
| Quotation | Recognition of remembered wording | `the love of money is the root of all evil` |
| Paraphrase | Meaning preserved with different language | `treat other people how you want to be treated` |
| Concept | Broad thematic discovery | `dealing with anxiety and worry` |
| Person or event | Narrative and entity retrieval | `David defeats Goliath` |

The benchmark uses three complementary ranking metrics:

- **Recall@5** — how much of the expected passage set appears in the first five results;
- **MRR@5** — how quickly the first relevant passage appears;
- **nDCG@5** — whether relevant passages are ordered near the top.

Relevance is determined through scripture-range overlap rather than brittle string equality. The scorer also prevents overlapping chunks from receiving duplicate credit for the same expected passage.

### Dense retrieval baseline

| Category | Recall@5 | MRR@5 | nDCG@5 |
| --- | ---: | ---: | ---: |
| **Overall** | **0.8200** | **0.6803** | **0.7073** |
| Reference | 0.8000 | 0.5033 | 0.5780 |
| Quotation | 1.0000 | 0.8833 | 0.9131 |
| Paraphrase | 0.9000 | 0.7750 | 0.8062 |
| Concept | 0.4000 | 0.3200 | 0.3007 |
| Person / event | 1.0000 | 0.9200 | 0.9387 |

The results show the core value of dense retrieval: quotations, paraphrases, and narrative searches perform strongly even when wording varies. They also expose the next quality targets clearly—deterministic reference lookup and stronger handling of broad concepts.

## Engineering highlights

- Zod-validated search requests with bounded `top-k` values.
- Shared embedding configuration for consistent indexing and querying.
- Batched OpenAI embedding calls to reduce indexing overhead.
- Qdrant payloads that keep every result explainable and citation-ready.
- Pure retrieval-metric utilities with unit coverage for range overlap, ranking, and duplicate-credit prevention.
- Live evaluation gated separately from local unit tests so quality measurement is deliberate and reproducible.
- Clear separation between corpus preparation, vector indexing, retrieval, presentation, and evaluation.

## Technology

**Next.js · TypeScript · OpenAI embeddings · Qdrant · Zod · Vitest**

## Current scope

The project intentionally returns source passages rather than generated explanations. That makes retrieval quality observable on its own, limits hallucination risk, and creates a reliable evidence layer that can later support grounded generation, hybrid dense/lexical search, reranking, and deterministic scripture-reference resolution.
