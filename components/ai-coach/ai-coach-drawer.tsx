"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { Bot, Loader2, Send, Sparkles, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function AiCoachDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { messages, sendMessage, status, error, stop } = useChat({
    experimental_throttle: 60,
    onFinish: () => {
      router.refresh();
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  const showThinking =
    status === "submitted" ||
    (status === "streaming" &&
      (!lastMessage ||
        lastMessage.role !== "assistant" ||
        messageText(lastMessage).trim().length === 0));

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, status]);

  async function submitMessage(event?: FormEvent<HTMLFormElement>, text = input) {
    event?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setInput("");
    await sendMessage({ text: trimmed });
  }

  return (
    <aside
      aria-label="AI Coach"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[calc(100vw-1rem)] max-w-96 flex-col border-r border-indigo-100 bg-white shadow-2xl ring-1 ring-indigo-100 transition-transform duration-200 md:left-60 md:w-96",
        open ? "translate-x-0" : "-translate-x-[calc(100%+15rem)]"
      )}
    >
      <header className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-200">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-semibold text-gray-950">
                  AI Coach
                </h2>
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <p className="truncate text-xs font-medium text-indigo-600">
                Fresh LifeOS context on every reply
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close AI Coach"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50/80 px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Ready when you are.
            </div>
            <div className="mt-3 grid gap-2">
              {[
                "What should I focus on today?",
                "Summarize my current progress.",
                "Where am I drifting from my goals?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(undefined, prompt)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => {
          const fromUser = message.role === "user";
          const text = messageText(message);
          if (!text) return null;

          return (
            <div
              key={message.id}
              className={cn("flex", fromUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm leading-relaxed shadow-sm",
                  fromUser
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 bg-white text-gray-800"
                )}
              >
                {text}
              </div>
            </div>
          );
        })}

        {showThinking ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Thinking
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700">
          {error.message}
        </div>
      ) : null}

      <form onSubmit={submitMessage} className="border-t border-gray-100 bg-white p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitMessage();
              }
            }}
            rows={1}
            placeholder="Ask your coach..."
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          {busy ? (
            <button
              type="button"
              aria-label="Stop response"
              onClick={stop}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-700"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-200 transition hover:from-indigo-600 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}
