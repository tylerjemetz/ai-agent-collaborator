"use client"; // This line must be at the very top

import { useState } from "react";

// Define the structure of our result data for TypeScript
interface Turn {
  round: number;
  speaker: string;
  text: string;
}

interface ResultData {
  summary: string;
  history: Turn[];
}

const Index = () => {
  const [question, setQuestion] = useState("");
  const [primaryBot, setPrimaryBot] = useState("");
  const [assistantJob, setAssistantJob] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleGenerate = async () => {
    if (!question.trim() || !primaryBot || !assistantJob) {
      setError("Please fill in all fields before generating.");
      return;
    }
    
    setResult(null);
    setError(null);
    setIsGenerating(true);

    try {
      const endpointUrl = "https://blmcbvrehzetsuqellip.supabase.co/functions/v1/orchestrate-ai";
      const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbWNidnJlaHpldHN1cWVsbGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODkzNzQsImV4cCI6MjA2ODM2NTM3NH0.75_CDABJ2gmKpXjF-jz5OHfAd4UuUqOwl9wGvIFXkM0";

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ 
          prompt: question,
          primaryBot: primaryBot,
          assistantJob: assistantJob
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "An unknown error occurred.");
      setResult(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result?.summary) {
      navigator.clipboard.writeText(result.summary);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold">AI Agent Collaborator</h1>
          <p className="text-lg text-gray-400">Harness the power of multiple AI models.</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="question" className="text-base font-medium">What would you like to explore?</label>
            <textarea
              id="question"
              placeholder="Ask anything..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full min-h-[120px] p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-base font-medium">Primary Bot</label>
              <select value={primaryBot} onChange={(e) => setPrimaryBot(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="" disabled>Choose your AI model</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium">Assistant's Job</label>
              <select value={assistantJob} onChange={(e) => setAssistantJob(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="" disabled>Define the assistant role</option>
                <option value="improve-code">Improve Code</option>
                <option value="creative-critic">Be a Creative Critic</option>
                <option value="simplify-topic">Simplify the Topic</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!question.trim() || !primaryBot || !assistantJob || isGenerating}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8">
          {error && <div className="text-center text-red-400"><h3 className="text-xl font-medium mb-2">An Error Occurred</h3><p>{error}</p></div>}
          {result && !error && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Collaboration Result:</h3>
                <button onClick={handleCopy} className="p-2 rounded-md hover:bg-gray-700">
                  {hasCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-gray-300">{result.summary}</p>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-400">Collaboration History:</h4>
                {result.history.map((turn) => (
                  <div key={turn.round} className="p-3 rounded-md border border-gray-700 bg-gray-900/50">
                    <p className="font-semibold text-sm text-blue-400">{turn.speaker}</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{turn.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isGenerating && !result && !error && (
             <div className="text-center text-gray-400 py-12">
               <h3 className="text-xl font-medium">Results will appear here</h3>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
