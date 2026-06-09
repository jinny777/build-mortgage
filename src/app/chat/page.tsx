"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatMessage } from "@/types";

const QUICK_QUESTIONS = [
  "연봉 6000만원이면 얼마까지 대출 가능해?",
  "신용점수 820점인데 금리에 영향 있나요?",
  "생애최초 혜택 받을 수 있는 조건이 뭔가요?",
  "DSR이 뭐야? 쉽게 설명해줘",
  "디딤돌대출 자격 요건이 어떻게 돼?",
  "카드론이 있으면 주담대에 영향이 있나요?",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            {message.content.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
              }
              if (line.startsWith("- ") || line.startsWith("• ")) {
                return <p key={i} className="pl-2">{line}</p>;
              }
              return line ? <p key={i}>{line}</p> : <br key={i} />;
            })}
          </div>
        )}
        <div className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-gray-400"}`}>
          {message.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "안녕하세요! 주택담보대출 AI 상담사입니다. 🏠\n\n대출 관련 궁금한 점을 자유롭게 물어보세요.\nDSR, LTV, 정책대출, 금리 등 무엇이든 답변드립니다!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message || data.error || "죄송합니다. 답변을 생성할 수 없습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([{
      role: "assistant",
      content: "안녕하세요! 주택담보대출 AI 상담사입니다. 🏠\n\n대출 관련 궁금한 점을 자유롭게 물어보세요.\nDSR, LTV, 정책대출, 금리 등 무엇이든 답변드립니다!",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AI 대출 상담</h1>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              온라인
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-1" />
          초기화
        </Button>
      </div>

      {/* 메시지 영역 */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-400">답변 생성 중...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 질문 */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2 pt-3">자주 묻는 질문</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 입력 영역 */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="궁금한 점을 입력하세요... (Enter로 전송)"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="px-4 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI 답변은 참고용입니다. 정확한 상담은 금융 전문가에게 문의하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
