"use client";

import { useState } from "react";

type SearchResult = { reference: string; text: string; score: number };

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    // Without setSearched(false), when a user runs a second search, the old "No relevant passages found." message would stay visible while the new request loads.
    setSearched(false)
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const res = await fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results);
      setSearched(true)
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brian.png" alt="Parsity logo" className="mb-4 h-100 w-auto" />
      <img src="/parsitylogo.png" alt="Parsity logo" className="mb-4 h-16 w-auto" />
      <h1 className="mb-4 text-center text-2xl font-semibold">Bible Search</h1>

      <form onSubmit={onSubmit} className="mb-6 flex w-full gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="bears maul children for mocking a prophet's bald head"
          className="flex-1 rounded bg-copilot-input px-3 py-2 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded bg-copilot-accent px-4 py-2 text-white disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-copilot-muted">Searching…</p>}
      {error && <p className="text-red-400">{error}</p>} 
      {searched && results.length === 0 && (
        <p className="text-copilot-muted">No relevant passages found.</p>
      )}
      <ul className="w-full space-y-4">
        {results.map((r) => (
          <li key={r.reference} className="rounded border border-copilot-border p-3">
            <div className="mb-1 flex justify-between">
              <strong>{r.reference}</strong>
              <span className="text-copilot-muted">{r.score.toFixed(3)}</span>
            </div>
            <p>{r.text}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
