"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { QueryResultTable } from "./components/QueryResultTable";
import { CopyButton } from "./components/CopyButton";

type AIInput = {
  query: string;
};

type AIOutput = {
  columns: string[];
  rows: Record<string, unknown>[];
};

const SUGGESTED_PROMPTS = [
  "Show me all products",
  "Which region had the highest total sales?",
  "What are the top 5 best-selling products?",
  "Show products that are low on stock (less than 5 units)",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          <div className="font-bold mb-2">
            {message.role === "user" ? (
              <span className="text-3xl">💁🏻</span>
            ) : (
              <span className="text-3xl">🤖</span>
            )}
          </div>
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div key={`${message.id}-${i}`} className="mb-2">
                    {part.text}
                  </div>
                );

              case "tool-db": {
                const input = part.input as unknown as AIInput;
                const output = part.output as unknown as AIOutput;
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="my-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
                  >
                    <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                      🔍 Database Query
                    </div>

                    {input?.query && (
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">SQL</span>
                          <CopyButton text={input.query} />
                        </div>
                        <pre className="text-xs bg-white dark:bg-zinc-900 p-2 rounded overflow-x-auto">
                          {input.query}
                        </pre>
                      </div>
                    )}

                    {part.state === "output-available" && output && (
                      <>
                        <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                          ✅ {output.rows?.length ?? 0} row
                          {output.rows?.length === 1 ? "" : "s"} returned
                        </div>
                        <QueryResultTable
                          columns={output.columns ?? []}
                          rows={output.rows ?? []}
                        />
                      </>
                    )}
                  </div>
                );
              }

              case "tool-schema":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="my-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800"
                  >
                    <div className="font-semibold text-purple-700 dark:text-purple-300">
                      📋 Schema Tool
                    </div>
                    {part.state === "output-available" && (
                      <div className="text-sm text-green-700 dark:text-green-300 py-2">
                        ✅ Schema loaded
                      </div>
                    )}
                  </div>
                );

              case "step-start":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="text-sm text-gray-500 dark:text-gray-400 my-4"
                  >
                    🔄 Processing...
                  </div>
                );

              case "reasoning":
                // Optional: show reasoning
                return null;

              default:
                return null;
            }
          })}
        </div>
      ))}

      {messages.length === 0 && (
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Try asking:</p>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage({ text: prompt })}
              className="text-left px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Ask about your database..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
