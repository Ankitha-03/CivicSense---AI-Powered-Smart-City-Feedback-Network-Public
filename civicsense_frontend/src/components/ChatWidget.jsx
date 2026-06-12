import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const WELCOME_MSG =
  "Hi, I can help you navigate CivicSense, understand issue statuses, or guide you through reporting a problem. What do you need help with?";

const QUICK_CHIPS = [
  "How do I report an issue?",
  "What is my report status?",
  "Which department handles roads?",
];

const MAX_HISTORY = 20;

// ── Chip rules: keywords in reply → suggested follow-up chips ──────────────
const CHIP_RULES = [
  {
    keywords: ["report form", "report an issue", "submit", "fill", "step", "photo", "severity"],
    chips: ["Take me to the report form", "What severity should I choose?"],
  },
  {
    keywords: ["department", "pwd", "municipal", "electricity department", "water supply", "town planning"],
    chips: ["Which department handles garbage?", "Which department handles roads?"],
  },
  {
    keywords: ["status", "pending", "in progress", "resolved", "track", "update"],
    chips: ["How do I track my report?", "What does In Progress mean?"],
  },
  {
    keywords: ["pothole", "road damage", "road"],
    chips: ["How do I rate severity?", "Take me to the report form"],
  },
  {
    keywords: ["garbage", "waste", "sanitation", "dump"],
    chips: ["Take me to the report form", "Which department handles garbage?"],
  },
  {
    keywords: ["streetlight", "light fault", "street light"],
    chips: ["Take me to the report form", "Which department handles streetlights?"],
  },
  {
    keywords: ["water leak", "water supply", "pipe burst"],
    chips: ["Take me to the report form", "Which department handles water leaks?"],
  },
  {
    keywords: ["minor", "moderate", "severe", "critical", "severity level"],
    chips: ["How do I choose severity?", "Take me to the report form"],
  },
  {
    keywords: ["frustrated", "unresolved", "no action", "ignored", "escalate"],
    chips: ["What are my next steps?", "How do I follow up on my report?"],
  },
];

// ── Route links: phrases in reply → inline navigation button ──────────────
const ROUTE_PATTERNS = [
  { pattern: /my reports page|\/my-reports|track.*your reports/i, label: "Go to My Reports", to: "/my-reports" },
  { pattern: /report form|report an issue|submit.*report|\/report\b/i, label: "Go to Report Form", to: "/report" },
];

function formatReply(text) {
  // Escape HTML first (source is our own backend, but be safe)
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // **bold** → <strong>
  const bolded = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // newlines → <br>
  return bolded.replace(/\n/g, "<br />");
}

function getContextChips(text) {
  const lower = text.toLowerCase();
  const seen = new Set();
  const result = [];
  for (const { keywords, chips } of CHIP_RULES) {
    if (keywords.some((k) => lower.includes(k))) {
      for (const chip of chips) {
        if (!seen.has(chip)) {
          seen.add(chip);
          result.push(chip);
          if (result.length === 3) return result;
        }
      }
    }
  }
  return result;
}

function getRouteLinks(text) {
  const links = [];
  const seen = new Set();
  for (const { pattern, label, to } of ROUTE_PATTERNS) {
    if (pattern.test(text) && !seen.has(to)) {
      seen.add(to);
      links.push({ label, to });
    }
  }
  return links;
}

function timestamp() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function makeMsg(role, content) {
  return { role, content, time: timestamp() };
}

function makeAssistantMsg(content) {
  return {
    role: "assistant",
    content,
    time: timestamp(),
    chips: getContextChips(content),
    links: getRouteLinks(content),
  };
}

export default function ChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [unread, setUnread] = useState(false);
  const [bounced, setBounced] = useState(false);
  const [messages, setMessages] = useState([makeMsg("assistant", WELCOME_MSG)]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBounced(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const opened = localStorage.getItem("cs_chat_opened");
    if (!opened) setUnread(true);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setUnread(false);
    localStorage.setItem("cs_chat_opened", "1");
  };

  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const pageHint = useCallback(() => {
    const p = location.pathname;
    if (p.startsWith("/report")) return "User is on the Report Issue page.";
    if (p.startsWith("/my-reports")) return "User is on the My Reports page.";
    if (p.startsWith("/issues/")) return "User is on an Issue Detail page.";
    if (p.startsWith("/city-health")) return "User is on the City Health Report page.";
    if (p === "/" || p === "") return "User is on the Landing page.";
    return "";
  }, [location.pathname]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const userMsg = makeMsg("user", trimmed);
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setShowChips(false);
    setLoading(true);

    const apiMessages = updated
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, page_hint: pageHint() }),
      });

      const data = await res.json();
      const replyText = data.reply || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, makeAssistantMsg(replyText)]);
    } catch {
      setMessages((prev) => [
        ...prev,
        makeAssistantMsg("I am having trouble connecting. Please try again in a moment."),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearConversation = () => {
    setMessages([makeMsg("assistant", WELCOME_MSG)]);
    setShowChips(true);
  };

  // Index of the last assistant message (for chip/link display)
  const lastAssistantIdx = messages.reduce(
    (last, m, i) => (m.role === "assistant" ? i : last),
    -1,
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={open ? handleClose : handleOpen}
        className={`fixed bottom-6 right-6 bg-[#1a56db] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1e429f] transition-colors duration-150 z-40 ${
          bounced && !open ? "animate-bounce-once" : ""
        }`}
        style={{ width: 52, height: 52 }}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {unread && !open && (
          <span
            className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            aria-label="Unread messages"
          />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 bg-white border border-gray-200 shadow-2xl z-40 flex flex-col animate-slide-up"
          style={{ width: 360, height: 480, borderRadius: 12 }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-[#1a56db]"
            style={{ borderRadius: "12px 12px 0 0" }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-white opacity-80" />
              <span className="text-sm font-semibold text-white">CivicSense Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearConversation}
                className="text-white opacity-60 hover:opacity-100 transition-opacity duration-150 p-1 rounded"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="text-white opacity-60 hover:opacity-100 transition-opacity duration-150 p-1 rounded"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1a56db] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <span dangerouslySetInnerHTML={{ __html: formatReply(m.content) }} />
                  ) : (
                    m.content
                  )}
                </div>

                {/* Timestamp */}
                {m.time && (
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1">{m.time}</span>
                )}

                {/* Inline route links — last assistant message only */}
                {m.role === "assistant" &&
                  i === lastAssistantIdx &&
                  m.links?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {m.links.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={handleClose}
                          className="text-xs font-medium text-[#1a56db] underline underline-offset-2 hover:text-[#1e429f] transition-colors duration-150"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}

                {/* Contextual chips — last assistant message only, after first interaction, not while loading */}
                {m.role === "assistant" &&
                  i === lastAssistantIdx &&
                  !showChips &&
                  !loading &&
                  m.chips?.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2 w-full">
                      {m.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => send(chip)}
                          className="self-start text-left text-xs border border-[#1a56db] text-[#1a56db] px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors duration-150"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Initial quick-reply chips */}
            {showChips && !loading && (
              <div className="flex flex-col gap-1.5 pt-1">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => send(chip)}
                    className="self-start text-left text-xs border border-[#1a56db] text-[#1a56db] px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors duration-150"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2.5 rounded-lg flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition-colors duration-150 disabled:opacity-60"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="px-3 py-2 bg-[#1a56db] text-white rounded-lg text-sm hover:bg-[#1e429f] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
