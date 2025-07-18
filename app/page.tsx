"use client"; // Important: This line must be at the very top

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Bot, Zap, Copy, Check } from "lucide-react";

// NOTE: We will skip creating individual component files for this MVP
// For a real project, these would be in separate files in a /components folder.

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">AI Agent Collaborator</h1>
          <p className="text-lg text-gray-400">Harness the power of multiple AI models.</p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-white">What would you like to explore?</Label>
              <Textarea
                placeholder="Ask anything..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[120px] bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2"><Bot />Primary Bot</Label>
                <Select value={primaryBot} onValueChange={setPrimaryBot}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white"><SelectValue placeholder="Choose AI model" /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2"><Zap />Assistant's Job</Label>
                <Select value={assistantJob} onValueChange={setAssistantJob}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white"><SelectValue placeholder="Define assistant role" /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectItem value="improve-code">Improve Code</SelectItem>
                    <SelectItem value="creative-critic">Be a Creative Critic</SelectItem>
                    <SelectItem value="simplify-topic">Simplify the Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!question.trim() || !primaryBot || !assistantJob || isGenerating}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8">
            {error && <div className="text-red-500"><h3 className="font-bold">An Error Occurred</h3><p>{error}</p></div>}
            {result && !error && (
              <div className="space-y-6 text-left text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Collaboration Result:</h3>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {hasCopied ? <Check className="text-green-500" /> : <Copy />}
                  </Button>
                </div>
                <p className="whitespace-pre-wrap">{result.summary}</p>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-400">Collaboration History:</h4>
                  {result.history.map((turn) => (
                    <div key={turn.round} className="p-3 rounded-md border border-gray-700 bg-gray-800">
                      <p className="font-semibold text-sm text-blue-400">{turn.speaker}</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{turn.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!isGenerating && !result && !error && (
              <div className="text-center text-gray-400">
                <h3>Results will appear here</h3>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
