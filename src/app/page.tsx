import Link from "next/link";
import { Video, Calculator, CheckCircle, ArrowRight, Star, TrendingUp, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Video,
    title: "유튜브 영상 분석",
    description: "대출 관련 유튜브 링크만 넣으면 AI가 핵심 내용을 3초 만에 요약해드립니다.",
    color: "bg-red-50 text-red-600",
    href: "/analyze",
  },
  {
    icon: Calculator,
    title: "맞춤형 대출 진단",
    description: "내 소득, 신용점수, 부채를 입력하면 LTV/DTI/DSR을 즉시 계산합니다.",
    color: "bg-blue-50 text-blue-600",
    href: "/profile",
  },
  {
    icon: TrendingUp,
    title: "단계별 실행 로드맵",
    description: "승인 가능성을 높이는 8단계 맞춤 실행 계획을 제공합니다.",
    color: "bg-emerald-50 text-emerald-600",
    href: "/report",
  },
  {
    icon: Shield,
    title: "정부 정책대출 추천",
    description: "디딤돌, 보금자리론 등 내 상황에 맞는 정책대출을 자동으로 추천합니다.",
    color: "bg-purple-50 text-purple-600",
    href: "/profile",
  },
];

const steps = [
  { number: "01", title: "유튜브 링크 입력", description: "분석하고 싶은 주담대 영상 URL을 붙여넣기" },
  { number: "02", title: "내 정보 입력", description: "소득, 신용점수, 주택 구매 계획 입력" },
  { number: "03", title: "AI 분석", description: "Claude AI가 영상과 내 상황을 종합 분석" },
  { number: "04", title: "맞춤 로드맵 수령", description: "대출 실행 계획과 PDF 보고서 다운로드" },
];

const stats = [
  { value: "98%", label: "분석 정확도" },
  { value: "30초", label: "평균 분석 시간" },
  { value: "6가지", label: "정부 정책대출 비교" },
  { value: "무료", label: "기본 서비스" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              AI 기반 주택담보대출 분석 서비스
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              유튜브 링크 하나로<br />
              <span className="text-blue-300">대출 성공 전략</span> 완성
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              영상 요약 · 핵심 전략 분석 · 대출 가능 금액 계산 · 단계별 실행 로드맵을<br className="hidden md:block" />
              한 번에 받아보세요. Claude AI가 당신의 주담대 성공을 도와드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/analyze">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                  <Video className="w-5 h-5 mr-2" />
                  영상 분석 시작하기
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  무료 대출 진단
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 통계 바 */}
        <div className="relative border-t border-white/20 bg-white/10 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 기능 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">이런 기능을 제공해요</h2>
          <p className="text-gray-500 text-lg">복잡한 주담대 과정을 AI가 쉽게 풀어드립니다</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">이렇게 사용하세요</h2>
            <p className="text-gray-500 text-lg">4단계로 완성되는 나만의 대출 로드맵</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-blue-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 최종 결과물 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">한 번의 분석으로 받는 것들</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                "영상 핵심 내용 요약",
                "LTV / DTI / DSR 계산",
                "대출 가능 금액 예측",
                "월 상환액 시뮬레이션",
                "정부 정책대출 추천",
                "단계별 실행 체크리스트",
                "부족 조건 개선 방안",
                "PDF 보고서 다운로드",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-300 flex-shrink-0" />
                  <span className="text-blue-100">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/analyze">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                지금 바로 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-gray-700">Mortgage AI Planner</span>
          </div>
          <p className="text-sm text-gray-500">
            본 서비스는 참고용이며 실제 대출 상담은 금융 전문가와 진행하세요.
          </p>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            © 2026 Mortgage AI Planner
          </div>
        </div>
      </footer>
    </div>
  );
}
