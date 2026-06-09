"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, DollarSign, Home, CreditCard, Loader2, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoanProfile } from "@/types";

const STEPS = [
  { id: 1, title: "기본 정보", icon: User },
  { id: 2, title: "금융 정보", icon: CreditCard },
  { id: 3, title: "주택 정보", icon: Home },
];

const initialProfile: LoanProfile = {
  age: 35,
  occupation: "직장인",
  annualIncome: 50000000,
  hasSpouse: false,
  spouseIncome: 0,
  dependents: 0,
  creditScore: 800,
  existingLoan: 0,
  carLoan: 0,
  cardLoan: 0,
  minusAccount: 0,
  targetRegion: "서울",
  propertyPrice: 500000000,
  isResidence: true,
  isFirstTimeBuyer: false,
  isHouseless: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<LoanProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof LoanProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("loanAnalysis", JSON.stringify(data));
        sessionStorage.setItem("loanProfile", JSON.stringify(profile));
        router.push("/report");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 대출 진단</h1>
        <p className="text-gray-500">정보를 입력하면 AI가 맞춤 대출 계획을 세워드립니다</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex flex-col items-center gap-1 ${step > s.id ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? "bg-blue-600 text-white" :
                  isCompleted ? "bg-emerald-500 text-white" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-gray-400"}`}>
                  {s.title}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 ${step > s.id ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: 기본 정보 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="나이"
                type="number"
                suffix="세"
                value={profile.age}
                onChange={(e) => update("age", parseInt(e.target.value) || 0)}
              />
              <Select
                label="직업"
                value={profile.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                options={[
                  { value: "직장인", label: "직장인 (근로소득)" },
                  { value: "자영업", label: "자영업자" },
                  { value: "프리랜서", label: "프리랜서" },
                  { value: "공무원", label: "공무원" },
                  { value: "전문직", label: "전문직 (의사/변호사 등)" },
                ]}
              />
            </div>

            <Input
              label="연소득"
              type="number"
              suffix="원"
              value={profile.annualIncome}
              onChange={(e) => update("annualIncome", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 -mt-2">
              세전 연봉 기준 / 약 {Math.round(profile.annualIncome / 10000).toLocaleString()}만원
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">배우자 유무</label>
              <div className="flex gap-3">
                {[
                  { value: false, label: "미혼 / 없음" },
                  { value: true, label: "기혼 / 있음" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => update("hasSpouse", opt.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      profile.hasSpouse === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {profile.hasSpouse && (
              <Input
                label="배우자 연소득"
                type="number"
                suffix="원"
                value={profile.spouseIncome || 0}
                onChange={(e) => update("spouseIncome", parseInt(e.target.value) || 0)}
              />
            )}

            <Select
              label="부양가족 수"
              value={String(profile.dependents)}
              onChange={(e) => update("dependents", parseInt(e.target.value))}
              options={[0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: n === 0 ? "없음" : `${n}명` }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: 금융 정보 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              금융 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                label="신용점수"
                type="number"
                suffix="점"
                value={profile.creditScore}
                onChange={(e) => update("creditScore", parseInt(e.target.value) || 0)}
              />
              <div className="mt-2 flex gap-2">
                {[
                  { range: "900+", label: "최우량", color: "bg-emerald-100 text-emerald-700" },
                  { range: "850-899", label: "우량", color: "bg-blue-100 text-blue-700" },
                  { range: "800-849", label: "양호", color: "bg-yellow-100 text-yellow-700" },
                  { range: "700-799", label: "주의", color: "bg-orange-100 text-orange-700" },
                ].map((item) => (
                  <span key={item.range} className={`text-xs px-2 py-1 rounded-full ${item.color}`}>
                    {item.range}: {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">기존 부채 현황</p>
              <Input
                label="기존 대출 잔액"
                type="number"
                suffix="원"
                value={profile.existingLoan}
                onChange={(e) => update("existingLoan", parseInt(e.target.value) || 0)}
              />
              <Input
                label="자동차 할부 잔액"
                type="number"
                suffix="원"
                value={profile.carLoan}
                onChange={(e) => update("carLoan", parseInt(e.target.value) || 0)}
              />
              <Input
                label="카드론 잔액"
                type="number"
                suffix="원"
                value={profile.cardLoan}
                onChange={(e) => update("cardLoan", parseInt(e.target.value) || 0)}
              />
              <Input
                label="마이너스통장 한도"
                type="number"
                suffix="원"
                value={profile.minusAccount}
                onChange={(e) => update("minusAccount", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <strong>DSR 계산 영향:</strong> 기존 부채가 많을수록 대출 가능 금액이 줄어듭니다.
              대출 전 카드론, 할부금 상환이 도움이 됩니다.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: 주택 정보 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              주택 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="매입 예정 지역"
              value={profile.targetRegion}
              onChange={(e) => update("targetRegion", e.target.value)}
              options={[
                { value: "서울 강남구", label: "서울 강남구 (투기과열)" },
                { value: "서울 서초구", label: "서울 서초구 (투기과열)" },
                { value: "서울 송파구", label: "서울 송파구 (투기과열)" },
                { value: "서울 용산구", label: "서울 용산구 (투기과열)" },
                { value: "서울 기타", label: "서울 기타" },
                { value: "경기 과천", label: "경기 과천 (조정)" },
                { value: "경기 성남", label: "경기 성남 (조정)" },
                { value: "경기 하남", label: "경기 하남 (조정)" },
                { value: "경기 기타", label: "경기 기타" },
                { value: "인천", label: "인천" },
                { value: "지방 광역시", label: "지방 광역시" },
                { value: "기타 지방", label: "기타 지방" },
              ]}
            />

            <Input
              label="주택 구매 예정 금액"
              type="number"
              suffix="원"
              value={profile.propertyPrice}
              onChange={(e) => update("propertyPrice", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 -mt-2">
              약 {Math.round(profile.propertyPrice / 100000000 * 10) / 10}억원
            </p>

            <div className="space-y-3">
              {[
                { field: "isResidence" as const, label: "실거주 목적인가요?", hint: "실거주 시 LTV 한도가 높아집니다" },
                { field: "isFirstTimeBuyer" as const, label: "생애최초 구매인가요?", hint: "생애최초 시 정부 지원 혜택이 있습니다" },
                { field: "isHouseless" as const, label: "현재 무주택자인가요?", hint: "무주택자 정책대출 자격이 됩니다" },
              ].map(({ field, label, hint }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <p className="text-xs text-gray-500 mb-2">{hint}</p>
                  <div className="flex gap-3">
                    {[
                      { value: true, label: "예" },
                      { value: false, label: "아니오" },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => update(field, opt.value)}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                          profile[field] === opt.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            이전
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1">
            다음
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI 분석 중...
              </>
            ) : (
              <>
                대출 진단 받기
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
