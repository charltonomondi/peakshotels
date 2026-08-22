/**
 * ChatPanel — reusable chat widget for host and candidate views.
 * Host sees all messages. Candidates only see host ↔ themselves (privacy enforced in context).
 */
import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import type { ChatMessage } from "./InterviewContext";

interface Props {
  messages: ChatMessage[];
  myId: string;
  myName: string;
  onSend: (text: string) => void;
  className?: string;
}

export default function ChatPanel({ messages, myId, onSend, className = "" }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className={`flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 shrink-0">
        <MessageSquare className="h-3.5 w-3.5 text-accent" />
        <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Chat</span>
        {messages.length > 0 && (
          <span className="ml-auto text-[10px] text-zinc-600">{messages.length}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <p className="text-[11px] text-zinc-600 text-center py-4">No messages yet</p>
        ) : (
          messages.map(m => {
            const isMine = m.senderId === myId;
            return (
              <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs leading-snug ${
                  isMine
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : m.senderRole === "host"
                    ? "bg-blue-800 text-blue-100 rounded-bl-sm"
                    : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                }`}>
                  {!isMine && (
                    <p className="text-[10px] font-semibold mb-0.5 opacity-70">
                      {m.senderRole === "host" ? "Host" : m.senderName}
                    </p>
                  )}
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-zinc-600 mt-0.5 px-1">
                  {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-zinc-800 shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          className="flex-1 bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-accent placeholder:text-zinc-600"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center disabled:opacity-40 shrink-0 transition-opacity"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
