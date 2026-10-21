import "dotenv/config"; // first!
import { createEmbedding } from "../../lib/openai";
import { qdrant, COLLECTION, SCORE_THRESHOLD } from "../../lib/qdrant";

async function main() {
  const query = process.argv[2] ?? "an eye for an eye"; // take the query from the command line, or use a default
  const k = 5; // how many results we want

  // 1. Turn the query into a vector, using the SAME model as the chunks.
  const vector = await createEmbedding(query);

  // 2. Ask Qdrant for the k closest points.
  const response = await qdrant.query(COLLECTION, {
    query: vector,
    limit: k,
    score_threshold: SCORE_THRESHOLD, // same cutoff as app/search/route.ts
    with_payload: true, // also return the stored info (reference, text...)
  });

  // Optionally, prints a message in that case an empty run doesn't look like a failure.
  if (response.points.length === 0) {
    console.log("No results above the score threshold.");
    return;
  }

  // 3. Print them.
  for (const point of response.points) {
    const p = point.payload as { reference: string; text: string };
    console.log(`${point.score.toFixed(3)}  ${p.reference}`);
    console.log(`   ${p.text.slice(0, 120)}...`);
  }
}

main(); 