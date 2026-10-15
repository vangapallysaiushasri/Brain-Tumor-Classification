"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, Sparkles, Loader2 } from "lucide-react";
import { useDiagnostic } from "@/context/diagnostic-context";
import { useAuth } from "@/context/auth-context";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "Explain LIME vs SHAP",
  "How does Grad-CAM work?",
  "Tell me about Gliomas",
  "How to export PDF report?",
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export function Chatbot() {
  const { prediction } = useDiagnostic();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello, Doctor! I am your AI Diagnostic Assistant. I can help answer questions about classification results, Grad-CAM, LIME, SHAP, and report generation. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (user) {
      const roleName = user.specialization === "Patient" ? "Patient" : "Doctor";
      setMessages([
        {
          sender: "bot",
          text: `Hello, ${roleName}! I am your AI Diagnostic Assistant. I can help answer questions about classification results, Grad-CAM, LIME, SHAP, and report generation. How can I help you today?`,
        },
      ]);
    }
  }, [user]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          diagnosis: prediction?.predicted_label ?? prediction?.tumor_type ?? null,
          role: user?.specialization === "Patient" ? "Patient" : "Doctor"
        }),
      });

      if (!response.ok) {
        throw new Error("Chat service unavailable");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I apologize, but I am experiencing connection issues. Please make sure the Flask backend server is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderText = (text: string) => {
    // Basic Markdown formatting helper for bold text (**bold**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-accent-cyan">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-6 z-50 lg:bottom-6">
        <motion.button
          onClick={() => setIsOpen((o) => !o)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan text-white shadow-lg shadow-accent-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-36 right-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-bg-card/95 shadow-2xl backdrop-blur-glass sm:w-[380px] lg:bottom-20"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-bg-elevated to-bg-card px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/20 text-accent-cyan">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-white">Neuro-XAI Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
                    <span className="text-[10px] text-text-muted">Online</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-text-muted hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-accent-blue text-white rounded-br-none"
                        : "bg-bg-elevated border border-border text-text-muted rounded-bl-none"
                    }`}
                  >
                    {renderText(m.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-4 py-2.5 text-xs text-text-muted rounded-bl-none">
                    <Loader2 className="h-3 w-3 animate-spin text-accent-cyan" />
                    Assistant is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 border-t border-border/30 bg-bg-elevated/20">
                <p className="text-[10px] text-text-muted mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent-cyan" /> Suggested queries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSend(s)}
                      className="rounded-full border border-border bg-bg-card hover:bg-accent-blue/10 hover:border-accent-blue/30 px-2.5 py-1 text-[10px] text-text-muted hover:text-accent-cyan transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3 bg-bg-card"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask assistant a question..."
                className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue hover:bg-accent-blue/80 text-white disabled:opacity-50 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
