"use client";
import { useState, useRef, useEffect, useCallback, startTransition } from "react";
import { X, Send, Bot, AlertTriangle, Shield, Zap, RotateCcw, Copy, Check, ChevronDown } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

const SUGGESTED_PROMPTS = [
  { label: "Triage this incident", icon: <AlertTriangle size={12} />, color: "var(--crit)", msg: "Triage this incident and give me a severity assessment, MITRE ATT&CK mapping, and immediate containment steps." },
  { label: "Draft resolution", icon: <Check size={12} />, color: "var(--ok)", msg: "Draft a resolution summary for this incident including root cause analysis and lessons learned." },
  { label: "NIST mapping", icon: <Shield size={12} />, color: "var(--primary)", msg: "Map this incident to the NIST Cybersecurity Framework and identify which controls failed." },
  { label: "Playbook steps", icon: <Zap size={12} />, color: "var(--high)", msg: "Generate a step-by-step incident response playbook for this type of threat." },
];

const FRAMEWORK_PROMPTS = [
  "What MITRE ATT&CK techniques are associated with this alert?",
  "Which PCI DSS requirements does this incident violate?",
  "What ISO 27001 controls apply to this security event?",
  "Is this a HIPAA reportable breach?",
  "What CIS Controls would prevent this attack?",
  "Generate a NIST SP 800-61 compliant incident report.",
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded transition-colors"
      style={{ color: copied ? "var(--ok)" : "var(--ink-4)" }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "var(--primary)", color: "white" }}>
          <Bot size={14} />
        </div>
      )}
      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className="px-3 py-2.5 rounded-[12px] text-[13px] leading-relaxed"
          style={{
            background: isUser ? "var(--primary)" : "var(--surface-2)",
            color: isUser ? "white" : "var(--ink)",
            border: isUser ? "none" : "1px solid var(--border)",
            borderBottomLeftRadius: !isUser ? 4 : 12,
            borderBottomRightRadius: isUser ? 4 : 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
          {msg.pending ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--ink-4)", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--ink-4)", animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--ink-4)", animationDelay: "300ms" }} />
            </span>
          ) : msg.content}
        </div>
        {!isUser && !msg.pending && msg.content && (
          <div className="flex items-center">
            <CopyBtn text={msg.content} />
          </div>
        )}
      </div>
    </div>
  );
}

export function AriaPanel() {
  const { ariaOpen, ariaContext, closeAria, addToast } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showFrameworks, setShowFrameworks] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (ariaOpen) {
      const greeting: Message = {
        id: "welcome",
        role: "assistant",
        content: ariaContext?.incidentTitle
          ? `Hello. I'm ARIA, your AI security analyst.\n\nI can see incident **${ariaContext.incidentId}** — "${ariaContext.incidentTitle}" (${ariaContext.incidentSeverity?.toUpperCase()}).\n\nHow can I help? I can triage this incident, map it to MITRE ATT&CK, generate a response playbook, or draft a resolution summary.`
          : "Hello. I'm ARIA — your Autonomous Response & Intelligence Assistant.\n\nI'm trained on NIST CSF, MITRE ATT&CK, ISO 27001, HIPAA, PCI DSS v4.0, and CIS Controls v8.\n\nAsk me to triage incidents, explain TTPs, assess compliance gaps, or generate response playbooks.",
      };
      startTransition(() => {
        setMessages([greeting]);
        if (ariaContext?.prefillMessage) setInput(ariaContext.prefillMessage);
      });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [ariaOpen, ariaContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || streaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    const pendingId = (Date.now() + 1).toString();
    const pendingMsg: Message = { id: pendingId, role: "assistant", content: "", pending: true };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput("");
    setStreaming(true);

    const apiMessages = [...messages.filter((m) => !m.pending && m.id !== "welcome"), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, context: ariaContext }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setMessages((prev) =>
            prev.map((m) => m.id === pendingId ? { ...m, content: full, pending: false } : m)
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) => m.id === pendingId
          ? { ...m, content: "Sorry, I encountered an error. Please check that ANTHROPIC_API_KEY is set and try again.", pending: false }
          : m)
      );
      addToast("ARIA service error", "error");
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, ariaContext, addToast]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleSuggestion(msg: string) {
    sendMessage(msg);
  }

  function handleStop() {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((prev) => prev.map((m) => m.pending ? { ...m, pending: false, content: "[Stopped]" } : m));
  }

  function handleReset() {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages([]);
    setTimeout(() => {
      const greeting: Message = {
        id: "welcome-2",
        role: "assistant",
        content: "Conversation cleared. How can I assist you?",
      };
      setMessages([greeting]);
    }, 100);
  }

  if (!ariaOpen) return null;

  const hasContext = !!ariaContext?.incidentId;

  return (
    <>
      <div className="fixed inset-0 z-[950]" style={{ background: "rgba(17,21,29,.3)" }} onClick={closeAria} />
      <aside className="slide-in-right fixed right-0 top-0 h-full z-[951] flex flex-col"
        style={{ width: "min(520px,100vw)", background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)" }}>
            <Bot size={16} color="white" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>ARIA</div>
            <div className="text-[11.5px]" style={{ color: "var(--ok)" }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 animate-pulse" style={{ background: "var(--ok)" }} />
              AI Security Analyst · Online
            </div>
          </div>
          <button onClick={handleReset} className="p-1.5 rounded-[7px] hover:bg-surface-3 transition-colors" title="Clear chat">
            <RotateCcw size={14} color="var(--ink-4)" />
          </button>
          <button onClick={closeAria} className="p-1.5 rounded-[7px] hover:bg-surface-3 transition-colors">
            <X size={16} color="var(--ink-3)" />
          </button>
        </div>

        {/* Context banner */}
        {hasContext && (
          <div className="px-4 py-2.5 border-b flex items-center gap-2"
            style={{ background: "var(--crit-tint)", borderColor: "var(--crit)" }}>
            <AlertTriangle size={13} color="var(--crit)" />
            <div className="flex-1 min-w-0">
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--crit)" }}>
                Incident {ariaContext.incidentId}
              </span>
              <span className="text-[11.5px] ml-1.5 truncate" style={{ color: "var(--ink-2)" }}>
                {ariaContext.incidentTitle}
              </span>
            </div>
            {ariaContext.incidentTtp && (
              <span className="px-1.5 py-0.5 rounded mono text-[10.5px] font-semibold shrink-0"
                style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>
                {ariaContext.incidentTtp}
              </span>
            )}
          </div>
        )}

        {/* Framework coverage badges */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b flex-wrap"
          style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          {["NIST CSF", "MITRE", "ISO 27001", "HIPAA", "PCI DSS", "CIS v8"].map((f) => (
            <span key={f} className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>
              {f}
            </span>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        {/* Quick actions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-3 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p.label} onClick={() => handleSuggestion(p.msg)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[9px] text-[12px] font-semibold text-left transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink-2)" }}>
                  <span style={{ color: p.color }}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>

            <button onClick={() => setShowFrameworks((v) => !v)}
              className="flex items-center gap-1 text-[11.5px] font-semibold self-start"
              style={{ color: "var(--ink-4)" }}>
              Framework questions
              <ChevronDown size={12} style={{ transform: showFrameworks ? "rotate(180deg)" : "", transition: "transform .15s" }} />
            </button>
            {showFrameworks && (
              <div className="flex flex-col gap-1">
                {FRAMEWORK_PROMPTS.map((p) => (
                  <button key={p} onClick={() => handleSuggestion(p)}
                    className="text-[12px] text-left px-3 py-1.5 rounded-[8px] transition-colors"
                    style={{ color: "var(--ink-3)", background: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-end gap-2 rounded-[11px] px-3 py-2"
            style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ARIA anything about security…"
              rows={1}
              className="flex-1 resize-none outline-none bg-transparent text-[13px] leading-relaxed"
              style={{ color: "var(--ink)", maxHeight: 120, minHeight: 22 }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
              disabled={streaming}
            />
            {streaming ? (
              <button onClick={handleStop}
                className="p-1.5 rounded-[7px] shrink-0"
                style={{ background: "var(--crit-tint)", color: "var(--crit)" }}>
                <span className="w-3 h-3 rounded-sm block" style={{ background: "var(--crit)" }} />
              </button>
            ) : (
              <button onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="p-1.5 rounded-[7px] shrink-0 transition-colors"
                style={{
                  background: input.trim() ? "var(--primary)" : "var(--surface)",
                  color: input.trim() ? "white" : "var(--ink-4)",
                }}>
                <Send size={14} />
              </button>
            )}
          </div>
          <div className="mt-1.5 text-[10.5px] text-center" style={{ color: "var(--ink-4)" }}>
            ARIA can make mistakes. Verify critical decisions independently.
          </div>
        </div>
      </aside>
    </>
  );
}
