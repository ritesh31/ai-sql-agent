"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import type { UIMessage } from "ai";
import { QueryResultTable } from "./QueryResultTable";
import { CopyButton } from "./CopyButton";

type AIInput = { query: string };
type AIOutput = { columns: string[]; rows: Record<string, unknown>[] };

type Props = {
  conversationId: string;
  initialMessages: UIMessage[];
  onSaved: () => void;
};

const SUGGESTED_PROMPTS = [
  "Show me all products",
  "Which region had the highest total sales?",
  "What are the top 5 best-selling products?",
  "Show products that are low on stock (less than 5 units)",
];

function getTitleFromMessages(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Chat";
  const textPart = firstUser.parts?.find((p) => p.type === "text");
  if (!textPart || textPart.type !== "text") return "New Chat";
  return textPart.text.slice(0, 60);
}

export function ChatInterface({ conversationId, initialMessages, onSaved }: Props) {
  const [input, setInput] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<
    Record<string, string[]>
  >({});
  const [loadingQuestions, setLoadingQuestions] = useState<Set<string>>(
    new Set()
  );

  const { messages, sendMessage } = useChat({
    messages: initialMessages,
    onFinish: async ({ messages: allMessages }) => {
      try {
        const title = getTitleFromMessages(allMessages);
        console.log("title", title);
        await fetch(`/api/conversations/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages, title }),
        });
        onSaved();
      } catch (e) {
        console.error("Failed to save conversation:", e);
      }
    },
  });

  // Generate suggested questions for assistant messages
  useEffect(() => {
    const generateQuestions = async () => {
      // Find the last assistant message that doesn't have questions yet
      const lastAssistantMsg = messages.findLast(
        (m) => m.role === "assistant" && !suggestedQuestions[m.id]
      );

      if (!lastAssistantMsg) return;
      if (loadingQuestions.has(lastAssistantMsg.id)) return;

      // Extract text response from message parts
      const textPart = lastAssistantMsg.parts?.find((p) => p.type === "text");
      if (!textPart || textPart.type !== "text") return;

      setLoadingQuestions((prev) => new Set(prev).add(lastAssistantMsg.id));

      try {
        const response = await fetch("/api/chat/suggested-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            lastResponse: textPart.text,
          }),
        });

        const data = await response.json();
        setSuggestedQuestions((prev) => ({
          ...prev,
          [lastAssistantMsg.id]: data.questions,
        }));
      } catch (e) {
        console.error("Failed to generate suggested questions:", e);
      } finally {
        setLoadingQuestions((prev) => {
          const next = new Set(prev);
          next.delete(lastAssistantMsg.id);
          return next;
        });
      }
    };

    generateQuestions();
    console.log('messages ', messages)
    console.log('suggestedQuestions ', suggestedQuestions)
    console.log('loadingQuestions ', loadingQuestions)
  }, [messages, suggestedQuestions, loadingQuestions]);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden">
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 max-w-lg mx-auto mt-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Try asking:
            </p>
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

        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="whitespace-pre-wrap">
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
                    const inp = part.input as unknown as AIInput;
                    const out = part.output as unknown as AIOutput;
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="my-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
                      >
                        <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          🔍 Database Query
                        </div>
                        {inp?.query && (
                          <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                SQL
                              </span>
                              <CopyButton text={inp.query} />
                            </div>
                            <pre className="text-xs bg-white dark:bg-zinc-900 p-2 rounded overflow-x-auto">
                              {inp.query}
                            </pre>
                          </div>
                        )}
                        {part.state === "output-available" && out && (
                          <>
                            <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                              ✅ {out.rows?.length ?? 0} row
                              {out.rows?.length === 1 ? "" : "s"} returned
                            </div>
                            <QueryResultTable
                              columns={out.columns ?? []}
                              rows={out.rows ?? []}
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
                    return null;

                  default:
                    return null;
                }
              })}
              {message.role === "assistant" && (
                <>
                  {loadingQuestions.has(message.id) && (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-4 flex items-center gap-2">
                      <span className="animate-spin">💡</span>
                      Finding follow-up questions...
                    </div>
                  )}
                  {suggestedQuestions[message.id] && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        💡 You might also want to know:
                      </p>
                      <div className="space-y-2">
                        {suggestedQuestions[message.id].map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage({ text: question })}
                            className="w-full text-left px-3 py-2 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-white dark:bg-zinc-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput("");
          }}
          className="max-w-lg mx-auto"
        >
          <input
            className="w-full dark:bg-zinc-900 p-2 border border-zinc-300 dark:border-zinc-800 rounded shadow-sm"
            value={input}
            placeholder="Ask about your database..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </form>
      </div>
    </div>
  );
}
