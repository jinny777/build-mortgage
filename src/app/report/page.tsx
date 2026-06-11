"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Download, CheckCircle, AlertTriangle, Star,
  TrendingUp, Shield, MapPin, Clock, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { formatCurrency, formatPercent, calculateMonthlyPayment } from "@/lib/utils";
import type { LoanAnalysis, LoanProfile, SimulationResult } from "@/types";

function MetricCard({
  label,
  value,
  unit,
  status,
  description,
}: {
  label: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "danger";
  description: string;
}) {
  const colors = {
    good: { bg: "bg-emerald-50", text: "text-emerald-700", badge: "success" as const },
    warning: { bg: "bg-amber-50", text: "text-amber-700", badge: "warning" as const },
    danger: { bg: "bg-red-50", text: "text-red-700", badge: "destructive" as const },
  };
  const c = colors[status];

  return (
    <div className={`${c.bg} rounded-xl p-4`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <Badge variant={c.badge}>{status === "good" ? "양호" : status === "warning" ? "주의" : "위험"}</Badge>
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>
        {value.toFixed(1)}{unit}
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function SimulationTable({ loanAmount, rate }: { loanAmount: number; rate: number }) {
  const scenarios: SimulationResult[] = [];
  const years = [20, 30, 40];
  const methods = [
    { key: "equal-principal-interest" as const, label: "원리금균등" },
    { key: "equal-principal" as const, label: "원금균등" },
  ];

  for (const y of years) {
    for (const m of methods) {
      const monthly = calculateMonthlyPayment(loanAmount, rate, y, m.key);
      const total = m.key === "equal-principal"
        ? loanAmount + (loanAmount / (y * 12)) * ((y * 12 + 1) / 2) * (rate / 100 / 12) * (y * 12)
        : monthly * y * 12;
      scenarios.push({
        years: y,
        method: m.key,
        monthlyPayment: monthly,
        totalInterest: total - loanAmount,
        totalPayment: total,
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 text-gray-600">상환 기간</th>
            <th className="text-left py-2 pr-4 text-gray-600">방식</th>
            <th className="text-right py-2 pr-4 text-gray-600">월 상환액</th>
            <th className="text-right py-2 pr-4 text-gray-600">총 이자</th>
            <th className="text-right py-2 text-gray-600">총 납입액</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s, i) => (
            <tr key={i} className={`border-b border-gray-100 ${i === 2 ? "bg-blue-50" : ""}`}>
              <td className="py-2 pr-4 font-medium">{s.years}년</td>
              <td className="py-2 pr-4 text-gray-600">
                {s.method === "equal-principal-interest" ? "원리금균등" : "원금균등"}
              </td>
              <td className="py-2 pr-4 text-right font-semibold">
                {formatCurrency(Math.round(s.monthlyPayment / 10000) * 10000)}
              </td>
              <td className="py-2 pr-4 text-right text-red-600">
                {formatCurrency(Math.round(s.totalInterest / 10000) * 10000)}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(Math.round(s.totalPayment / 10000) * 10000)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const METHOD_OPTIONS = [
  { value: "equal-principal-interest", label: "원리금균등상환" },
  { value: "equal-principal", label: "원금균등상환" },
  { value: "bullet", label: "만기일시상환" },
];

const YEAR_OPTIONS = [10, 15, 20, 30, 40].map((y) => ({ value: String(y), label: `${y}년` }));

function LoanSimulator({ defaultLoanAmount, defaultRate }: { defaultLoanAmount: number; defaultRate: number }) {
  const [amountMan, setAmountMan] = useState(String(Math.round(defaultLoanAmount / 10000)));
  const [rate, setRate] = useState(String(defaultRate.toFixed(2)));
  const [years, setYears] = useState("30");
  const [method, setMethod] = useState<"equal-principal-interest" | "equal-principal" | "bullet">(
    "equal-principal-interest"
  );

  const loanAmount = (Number(amountMan) || 0) * 10000;
  const rateNum = Number(rate) || 0;
  const yearsNum = Number(years);

  const monthlyPayment = calculateMonthlyPayment(loanAmount, rateNum, yearsNum, method);

  let totalPayment: number;
  if (method === "bullet") {
    totalPayment = monthlyPayment * yearsNum * 12 + loanAmount;
  } else if (method === "equal-principal") {
    const principalPayment = loanAmount / (yearsNum * 12);
    totalPayment =
      loanAmount +
      principalPayment * ((yearsNum * 12 + 1) / 2) * (rateNum / 100 / 12) * (yearsNum * 12);
  } else {
    totalPayment = monthlyPayment * yearsNum * 12;
  }
  const totalInterest = totalPayment - loanAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          나만의 대출 시뮬레이션
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-500 mb-4">
          대출금액, 금리, 상환기간, 상환방식을 직접 입력해 월 상환액과 총 이자를 계산해보세요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Input
            label="대출금액"
            type="number"
            value={amountMan}
            onChange={(e) => setAmountMan(e.target.value)}
            suffix="만원"
          />
          <Input
            label="예상 금리"
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            suffix="%"
          />
          <Select
            label="상환기간"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            options={YEAR_OPTIONS}
          />
          <Select
            label="상환방식"
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            options={METHOD_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">
              {method === "equal-principal" ? "월 상환액 (첫 달 기준)" : "월 상환액"}
            </div>
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(Math.round(monthlyPayment / 10000) * 10000)}
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">총 이자</div>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(Math.round(totalInterest / 10000) * 10000)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">총 납입액</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(Math.round(totalPayment / 10000) * 10000)}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          * 원금균등 방식의 월 상환액은 첫 달 기준이며 매월 감소합니다. 만기일시상환은 만기 시 원금을 일시 상환합니다.
        </p>
      </CardContent>
    </Card>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [analysis, setAnalysis] = useState<LoanAnalysis | null>(null);
  const [profile, setProfile] = useState<LoanProfile | null>(null);
  const [showAllGovLoans, setShowAllGovLoans] = useState(false);

  useEffect(() => {
    const savedAnalysis = sessionStorage.getItem("loanAnalysis");
    const savedProfile = sessionStorage.getItem("loanProfile");
    if (savedAnalysis && savedProfile) {
      setAnalysis(JSON.parse(savedAnalysis));
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 1.5, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("대출분석보고서.pdf");
  };

  if (!analysis || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">분석 결과가 없습니다</h2>
        <p className="text-gray-500 mb-6">먼저 대출 프로필을 입력해주세요</p>
        <Button onClick={() => router.push("/profile")}>대출 진단 시작하기</Button>
      </div>
    );
  }

  const approvalStars = Math.round(analysis.approvalProbability / 20);
  const avgRate = (analysis.estimatedRate.min + analysis.estimatedRate.max) / 2;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 액션 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/profile")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          다시 입력하기
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          PDF 다운로드
        </Button>
      </div>

      <div ref={reportRef} className="space-y-6">
        {/* 헤더 */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-200" />
                  <span className="text-blue-200 text-sm">{profile.targetRegion}</span>
                  <span className="text-blue-300">·</span>
                  <span className="text-blue-200 text-sm">{formatCurrency(profile.propertyPrice)}</span>
                </div>
                <h1 className="text-2xl font-bold mb-1">대출 분석 보고서</h1>
                <p className="text-blue-200 text-sm">
                  {new Date().toLocaleDateString("ko-KR")} 기준
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-200 mb-1">승인 가능성</div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${i < approvalStars ? "text-yellow-400 fill-yellow-400" : "text-blue-400"}`}
                    />
                  ))}
                </div>
                <div className="text-white font-semibold mt-1">{analysis.approvalProbability}점 / 100점</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 핵심 지표 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">핵심 지표</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <MetricCard
              label="DSR (총부채원리금상환비율)"
              value={analysis.dsr}
              unit="%"
              status={analysis.dsr <= 40 ? "good" : analysis.dsr <= 50 ? "warning" : "danger"}
              description="기준: 40% 이하 (은행권)"
            />
            <MetricCard
              label="DTI (총부채상환비율)"
              value={analysis.dti}
              unit="%"
              status={analysis.dti <= 50 ? "good" : analysis.dti <= 60 ? "warning" : "danger"}
              description="기준: 50% 이하 권장"
            />
            <MetricCard
              label="LTV (주택담보인정비율)"
              value={analysis.ltv}
              unit="%"
              status={analysis.ltv <= 60 ? "good" : analysis.ltv <= 70 ? "warning" : "danger"}
              description="기준: 지역별 50-70%"
            />
          </div>

          {/* 예상 대출 결과 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "예상 대출 한도", value: formatCurrency(analysis.maxLoanAmount), highlight: true },
              { label: "예상 금리", value: `${analysis.estimatedRate.min}~${analysis.estimatedRate.max}%`, highlight: false },
              { label: "월 상환액 (30년)", value: formatCurrency(Math.round(analysis.monthlyPayment / 10000) * 10000), highlight: false },
              { label: "총 이자 비용", value: formatCurrency(Math.round(analysis.totalInterest / 100000000 * 10) / 10 * 100000000), highlight: false },
            ].map((item) => (
              <Card key={item.label} className={item.highlight ? "border-blue-200 bg-blue-50" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className={`font-bold ${item.highlight ? "text-blue-700 text-lg" : "text-gray-900"}`}>
                    {item.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 문제점 및 개선 방안 */}
        {analysis.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                현재 문제점 및 개선 방안
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                {analysis.issues.map((issue, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                    issue.severity === "high" ? "bg-red-50" :
                    issue.severity === "medium" ? "bg-amber-50" : "bg-yellow-50"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      issue.severity === "high" ? "text-red-500" :
                      issue.severity === "medium" ? "text-amber-500" : "text-yellow-500"
                    }`} />
                    <div>
                      <span className="font-medium text-sm text-gray-900">{issue.type}</span>
                      <p className="text-sm text-gray-600 mt-0.5">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                개선 시 대출 한도 증가 예상
              </h3>
              <div className="space-y-3">
                {analysis.improvements.map((imp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-gray-900">{imp.action}</span>
                        <span className="text-emerald-700 font-semibold text-sm whitespace-nowrap">
                          +{formatCurrency(imp.estimatedIncrease)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{imp.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 단계별 로드맵 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              단계별 대출 실행 로드맵
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {analysis.roadmap.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    {i < analysis.roadmap.length - 1 && (
                      <div className="w-0.5 h-6 bg-blue-100 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{step.title}</span>
                      {step.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 정부 정책대출 추천 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              정부 정책대출 추천
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {analysis.governmentLoans
                .slice(0, showAllGovLoans ? undefined : 3)
                .map((loan, i) => (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
                    loan.eligible ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      loan.eligible ? "bg-emerald-500 text-white" : "bg-gray-300 text-gray-600"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{loan.name}</span>
                        <Badge variant={loan.eligible ? "success" : "secondary"}>
                          {loan.eligible ? "신청 가능" : "조건 불충족"}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>최대 {formatCurrency(loan.maxAmount)}</span>
                        <span>금리 {formatPercent(loan.maxRate)} 이하</span>
                      </div>
                      {loan.eligibilityReason && (
                        <p className="text-xs text-gray-400 mt-1">
                          {loan.eligible ? "※ " : "✗ "}{loan.eligibilityReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowAllGovLoans(!showAllGovLoans)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showAllGovLoans ? (
                <><ChevronUp className="w-4 h-4" />접기</>
              ) : (
                <><ChevronDown className="w-4 h-4" />전체 보기 ({analysis.governmentLoans.length}개)</>
              )}
            </button>
          </CardContent>
        </Card>

        {/* 상환 시뮬레이터 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              대출 상환 시뮬레이션
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500 mb-4">
              대출금 {formatCurrency(analysis.maxLoanAmount)} · 금리 {formatPercent(avgRate)} 기준
            </p>
            <SimulationTable loanAmount={analysis.maxLoanAmount} rate={avgRate} />
            <p className="text-xs text-gray-400 mt-3">
              * 원금균등 방식의 월 상환액은 첫 달 기준입니다. 매월 감소합니다.
            </p>
          </CardContent>
        </Card>

        {/* 나만의 시뮬레이션 */}
        <LoanSimulator defaultLoanAmount={analysis.maxLoanAmount} defaultRate={avgRate} />

        {/* 면책 조항 */}
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <strong>주의사항:</strong> 본 분석은 AI 기반 추정치이며, 실제 대출 가능 금액 및 조건은 금융기관 심사에 따라 달라질 수 있습니다.
          정확한 상담은 금융 전문가 또는 금융기관에 문의하세요. 2026년 기준 규제를 반영하였으나 최신 정책 변경이 있을 수 있습니다.
        </div>
      </div>
    </div>
  );
}
