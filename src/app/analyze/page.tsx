"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Search, AlertCircle, CheckCircle, Loader2, ArrowRight, BookOpen, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { YoutubeAnalysis } from "@/types";

const EXAMPLE_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
];

export default function AnalyzePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<YoutubeAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("유튜브 URL을 입력해주세요.");
      return;
    }
    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        return;
      }

      setResult(data);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-600 mb-4">
          <Video className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">유튜브 영상 분석</h1>
        <p className="text-gray-500">주담대 관련 유튜브 링크를 입력하면 AI가 핵심 내용을 분석해드립니다</p>
      </div>

      {/* URL 입력 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                error={error}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading} size="default" className="shrink-0">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">{isLoading ? "분석 중..." : "분석하기"}</span>
            </Button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <p className="mt-3 text-xs text-gray-400">
            * 자막이 있는 유튜브 영상만 분석 가능합니다. 영상 길이가 길수록 분석에 시간이 걸릴 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 분석 중...</h3>
            <p className="text-gray-500">자막을 추출하고 핵심 내용을 분석하고 있습니다. 30초 정도 소요됩니다.</p>
            <div className="mt-4 flex justify-center gap-2">
              {["자막 추출", "내용 분석", "전략 도출"].map((step, i) => (
                <Badge key={step} variant={i === 0 ? "default" : "secondary"}>
                  {step}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 분석 결과 */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* 영상 정보 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`}
                    alt="썸네일"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{result.title}</h2>
                  <p className="text-sm text-gray-500 truncate">{result.url}</p>
                </div>
                <Badge variant="success">분석 완료</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 3줄 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                핵심 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-blue-50 rounded-xl p-4">
                {result.summary.split("\n").map((line: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                    <span className="text-blue-600 font-bold text-sm mt-0.5">{i + 1}.</span>
                    <p className="text-gray-700 text-sm leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 핵심 포인트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  핵심 포인트
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {result.keyPoints.map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 주의사항 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  주의사항
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {result.warnings.map((warning: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 대출 전략 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                영상에서 언급된 대출 전략
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.loanStrategies.map((strategy: string, i: number) => (
                  <div key={i} className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="text-xs text-yellow-600 font-semibold mb-1">전략 {i + 1}</div>
                    <p className="text-sm text-gray-700">{strategy}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 다음 단계 CTA */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">내 상황에 맞는 대출 진단도 받아보세요</h3>
                  <p className="text-blue-200 text-sm">소득, 신용점수 정보 입력 후 맞춤형 대출 가능 금액을 확인하세요</p>
                </div>
                <Button
                  className="bg-white text-blue-700 hover:bg-blue-50 shrink-0"
                  onClick={() => router.push("/profile")}
                >
                  대출 진단 받기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 초기 상태 - 가이드 */}
      {!result && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🔍", title: "자막 자동 추출", desc: "한국어/영어 자막을 자동으로 인식합니다" },
            { icon: "🤖", title: "AI 핵심 분석", desc: "Claude AI가 대출 관련 핵심 내용을 추출합니다" },
            { icon: "📋", title: "전략 도출", desc: "영상의 대출 전략과 주의사항을 정리합니다" },
          ].map((item) => (
            <Card key={item.title} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
