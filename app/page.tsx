"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface Turn { round: number; speaker: string; text: string; }
interface ResultData { summary: string; history: Turn[]; }

export default function Page() {
  const [q, setQ] = useState("");
  const [bot, setBot] = useState("gpt-4o");
  const [job, setJob] = useState("improve-code");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "code" | "history">("overview");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        "https://blmcbvrehzetsuqellip.supabase.co/functions/v1/orchestrate-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…75_CDABJ2gmKpXjF-jz5OHfAd4UuUqOwl9wGvIFXkM0",
            apikey:      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…75_CDABJ2gmKpXjF-jz5OHfAd4UuUqOwl9wGvIFXkM0"
          },
          body: JSON.stringify({ prompt: q, primaryBot: bot, assistantJob: job })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadZip = async () => {
    if (!result) return;
    const zip = new JSZip();
    zip.file("summary.txt", result.summary);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "ai-summary.zip");
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">AI Agent Collaborator</h1>

      <textarea
        rows={3}
        className="w-full p-3 bg-gray-800 rounded mb-4"
        placeholder="Ask anything…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="flex gap-2 mb-6">
        <select
          className="p-2 bg-gray-800 rounded"
          value={bot}
          onChange={(e) => setBot(e.target.value)}
        >
          <option value="gpt-4o">GPT‑4o</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        </select>
        <select
          className="p-2 bg-gray-800 rounded"
          value={job}
          onChange={(e) => setJob(e.target.value)}
        >
          <option value="improve-code">Improve Code</option>
          <option value="creative-critic">Creative Critic</option>
          <option value="simplify-topic">Simplify Topic</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
          disabled={!q || loading}
          onClick={handleGenerate}
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && <div className="text-red-400 mb-6">Error: {error}</div>}

      {/* ─── Tabs ─── */}
      <div className="flex border-b border-gray-700 mb-4">
        {(["overview", "code", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              `px-4 py-2 -mb-px ` +
              (tab === t
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-400")
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── Overview ─── */}
      {tab === "overview" && result && (
        <div>
          <p className="whitespace-pre-wrap">{result.summary}</p>
          <div className="mt-4 flex gap-2">
            <button
              className="px-3 py-1 bg-green-600 rounded"
              onClick={() => navigator.clipboard.writeText(result.summary)}
            >
              Copy
            </button>
            <button
              className="px-3 py-1 bg-indigo-600 rounded"
              onClick={downloadZip}
            >
              Download ZIP
            </button>
          </div>
        </div>
      )}

      {/* ─── Code ─── */}
      {tab === "code" && result && (
        <pre className="whitespace-pre-wrap">{result.summary}</pre>
      )}

      {/* ─── History ─── */}
      {tab === "history" && result && (
        <div>
          {result.history.map((turn) => (
            <details
              key={turn.round}
              className="mb-3 bg-gray-800 p-3 rounded"
            >
              <summary className="cursor-pointer font-medium">
                {turn.speaker}
              </summary>
              <p className="mt-2 whitespace-pre-wrap">{turn.text}</p>
            </details>
          ))}
        </div>
      )}

      {!result && !error && (
        <div className="text-gray-500 mt-8 text-center">
          Your results will appear here…
        </div>
      )}
    </div>
  );
}
