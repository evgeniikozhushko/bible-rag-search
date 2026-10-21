import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmbedding } from "../../lib/openai";
import { qdrant, COLLECTION, SCORE_THRESHOLD } from "../../lib/qdrant";

// What the request body must look like: {"query": "...", "k": 5}
// k is optional (defaults to 5) and must be a whole number from 1 to 50.
const SearchRequestSchema = z.object({
  query: z.string().trim().min(1),
  k: z.number().int().min(1).max(50).default(5),
});

export async function POST(request: Request) {
  try {
    // 1. Parse the body; a bad shape throws ZodError, bad JSON throws SyntaxError (both -> 400 below).
    const { query, k } = SearchRequestSchema.parse(await request.json());

    // 2. Turn the query into a vector (same model as the chunks).
    const vector = await createEmbedding(query);

    // 3. Ask Qdrant for the k closest chunks.
    const response = await qdrant.query(COLLECTION, {
      query: vector,
      limit: k,
      with_payload: true,
      score_threshold: SCORE_THRESHOLD,
    });

    // 4. Return only what the assignment asks for: reference, text, score.
    const results = response.points.map((point) => {
      const p = point.payload as { reference: string; text: string };
      return { reference: p.reference, text: p.text, score: point.score };
    });
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
