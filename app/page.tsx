// app/page.tsx
"use client"; // This must be the very first line

// app/page.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// --- IMPORTANT: Choose ONE of these styles to uncomment, or add your preferred one ---
// For a dark theme:
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// For a light theme (e.g., from an older version, or you can find other light ones):
// import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'; // A basic light theme
// You can browse more styles at: https://github.com/react-syntax-highlighter/react-syntax-highlighter/tree/master/src/styles/prism

// If you were using `Prism.highlightAll()` directly, you might have
// imported Prism like this:
// import Prism from 'prismjs';
// import 'prismjs/themes/prism-okaidia.css'; // Example Prism.js CSS
// import 'prismjs/components/prism-javascript'; // Example language component

// Since we're using react-syntax-highlighter's Prism component,
// the global Prism.highlightAll() might not be strictly necessary
// for markdown code blocks, but it won't hurt if you have other
// global Prism.js uses.
// useEffect(() => {
//   if (typeof window !== 'undefined' && window.Prism) {
//     window.Prism.highlightAll();
//   }
// }, [activeTab, summary, history]);


export default function Home() {
  const [markdownInput, setMarkdownInput] = useState('');
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Choose your SyntaxHighlighter style here ---
  // For this example, we'll use `oneDark` which was imported above.
  const codeBlockStyle = oneDark; // Or `prism`, or another style you import

  // Function to call Supabase Edge Function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orchestrate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, // Ensure this env var is correct
        },
        body: JSON.stringify({
          prompt: markdownInput,
          primaryBot: 'OpenAI GPT-4', // Or whatever default you prefer
          assistantJob: 'Generate code based on prompt and then critique/revise it.',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
      setHistory(data.history);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  const handleDownloadZip = async () => {
    // This part assumes you still have jszip and file-saver set up correctly
    // If not, we'll need to re-add those steps.
    alert('Download ZIP functionality is not yet fully implemented in this template.');
    // Example (uncomment and ensure JSZip and file-saver are installed if you want this):
    // const zip = new JSZip();
    // zip.file("summary.md", summary);
    // history.forEach((item, index) => {
    //   zip.file(`history_${index + 1}.md`, item.content);
    // });
    // const content = await zip.generateAsync({ type: "blob" });
    // saveAs(content, "collaboration.zip");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">AI Agent Collaborator</h1>
        <p className="text-lg mt-2">Generate, Critique, and Revise Code with AI</p>
      </header>

      <main className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
            rows={5}
            placeholder="Enter your prompt here (e.g., 'Create a React component for a button with hover effects and dark mode support.')"
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['Overview', 'Code', 'History'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'Overview' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h2 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Overview Summary</h2>
              {summary ? (
                <>
                  <div className="prose dark:prose-invert max-w-none">
                    {/* Summary generally doesn't have complex code blocks that need highlighting */}
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={handleCopySummary}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-md text-sm"
                    >
                      Copy Summary
                    </button>
                    <button
                      onClick={handleDownloadZip}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-md text-sm"
                    >
                      Download ZIP
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">Generate some content to see the overview summary here.</p>
              )}
            </div>
          )}

          {activeTab === 'Code' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h2 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Generated Code</h2>
              {summary ? (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        if (className && match) {
                          return (
                            <SyntaxHighlighter
                              style={codeBlockStyle} // Apply the chosen style here!
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          );
                        } else {
                          return <code className={className || ""} {...props}>{children}</code>;
                        }
                      },
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">Generate some content to see the code here.</p>
              )}
            </div>
          )}

          {activeTab === 'History' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h2 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Collaboration History</h2>
              {history.length > 0 ? (
                <div>
                  {history.map((item, index) => (
                    <details key={index} className="mb-4 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm">
                      <summary className="font-semibold cursor-pointer text-gray-800 dark:text-gray-100">
                        {item.role} - Turn {index + 1}
                      </summary>
                      <div className="prose dark:prose-invert mt-2 max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "");
                              if (className && match) {
                                return (
                                  <SyntaxHighlighter
                                    style={codeBlockStyle} // Apply the chosen style here!
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                );
                              } else {
                                return <code className={className || ""} {...props}>{children}</code>;
                              }
                            },
                          }}
                        >
                          {item.content}
                        </ReactMarkdown>
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">Collaboration history will appear here after generation.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
