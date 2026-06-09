import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { LoanProfile, LoanAnalysis } from "@/types";
import { calculateMonthlyPayment } from "@/lib/utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function calculateLoanMetrics(profile: LoanProfile) {
  const {
    annualIncome,
    spouseIncome = 0,
    hasSpouse,
    propertyPrice,
    existingLoan,
    carLoan,
    cardLoan,
    minusAccount,
    creditScore,
    isFirstTimeBuyer,
    isHouseless,
    isResidence,
    targetRegion,
  } = profile;

  const totalIncome = annualIncome + (hasSpouse ? spouseIncome : 0);

  // LTV 기준 설정 (투기과열지구 기준)
  const isHighPriceArea = ["서울", "강남", "송파", "서초", "용산"].some((area) =>
    targetRegion.includes(area)
  );

  let maxLTVRate = isResidence ? 0.7 : 0.6;
  if (isHighPriceArea) maxLTVRate = isResidence ? 0.5 : 0.4;
  if (propertyPrice > 900000000) maxLTVRate = Math.min(maxLTVRate, 0.5);

  // DSR 40% 기준 최대 대출
  const dsrLimit = 0.4;
  const monthlyIncome = totalIncome / 12;
  const maxMonthlyDebt = monthlyIncome * dsrLimit;

  // 기존 부채의 월 상환액
  const existingMonthly =
    existingLoan / 240 + carLoan / 60 + cardLoan / 12 + minusAccount * 0.005;
  const availableMonthly = Math.max(0, maxMonthlyDebt - existingMonthly);

  // 30년 3.8% 기준 역산
  const assumedRate = 0.038;
  const maxByDSR = (availableMonthly * (Math.pow(1 + assumedRate / 12, 360) - 1)) /
    ((assumedRate / 12) * Math.pow(1 + assumedRate / 12, 360));

  const maxByLTV = propertyPrice * maxLTVRate;
  const maxLoanAmount = Math.min(maxByDSR, maxByLTV, 900000000);

  // DSR 계산
  const newLoanMonthly = calculateMonthlyPayment(maxLoanAmount, assumedRate * 100, 30, "equal-principal-interest");
  const totalMonthlyDebt = existingMonthly + newLoanMonthly;
  const dsr = (totalMonthlyDebt * 12 / totalIncome) * 100;
  const dti = (totalMonthlyDebt * 12 / totalIncome) * 100;
  const ltv = (maxLoanAmount / propertyPrice) * 100;

  // 승인 가능성 점수 (0-100)
  let approvalScore = 60;
  if (creditScore >= 900) approvalScore += 20;
  else if (creditScore >= 850) approvalScore += 15;
  else if (creditScore >= 800) approvalScore += 10;
  else if (creditScore >= 750) approvalScore += 0;
  else if (creditScore >= 700) approvalScore -= 10;
  else approvalScore -= 20;

  if (dsr < 30) approvalScore += 10;
  else if (dsr < 40) approvalScore += 5;
  else if (dsr > 50) approvalScore -= 15;

  if (isFirstTimeBuyer) approvalScore += 5;
  if (isHouseless) approvalScore += 5;

  approvalScore = Math.min(100, Math.max(0, approvalScore));

  // 금리 범위
  let rateMin = 3.5;
  let rateMax = 4.5;
  if (creditScore >= 900) { rateMin = 3.2; rateMax = 3.8; }
  else if (creditScore >= 850) { rateMin = 3.4; rateMax = 4.0; }
  else if (creditScore >= 800) { rateMin = 3.6; rateMax = 4.2; }
  else { rateMin = 4.0; rateMax = 5.0; }

  const monthlyPayment = calculateMonthlyPayment(maxLoanAmount, (rateMin + rateMax) / 2, 30, "equal-principal-interest");
  const totalInterest = monthlyPayment * 360 - maxLoanAmount;

  return {
    ltv,
    dti,
    dsr,
    maxLoanAmount,
    estimatedRate: { min: rateMin, max: rateMax },
    monthlyPayment,
    totalInterest,
    approvalProbability: approvalScore,
    totalIncome,
    maxByDSR,
    maxByLTV,
  };
}

function getGovernmentLoans(profile: LoanProfile) {
  const { annualIncome, isFirstTimeBuyer, isHouseless, propertyPrice, isResidence } = profile;

  const loans = [
    {
      name: "디딤돌대출",
      maxAmount: 300000000,
      maxRate: 3.0,
      eligible: annualIncome <= 60000000 && isHouseless && propertyPrice <= 500000000,
      eligibilityReason:
        annualIncome > 60000000
          ? "연소득 6천만원 초과"
          : !isHouseless
          ? "유주택자"
          : propertyPrice > 500000000
          ? "주택가격 5억 초과"
          : undefined,
      priority: 1,
    },
    {
      name: "보금자리론",
      maxAmount: 360000000,
      maxRate: 4.2,
      eligible: annualIncome <= 70000000 && isHouseless && propertyPrice <= 600000000,
      eligibilityReason:
        annualIncome > 70000000
          ? "연소득 7천만원 초과"
          : !isHouseless
          ? "유주택자"
          : propertyPrice > 600000000
          ? "주택가격 6억 초과"
          : undefined,
      priority: 2,
    },
    {
      name: "특례보금자리론",
      maxAmount: 500000000,
      maxRate: 4.65,
      eligible: propertyPrice <= 900000000 && isResidence,
      eligibilityReason:
        propertyPrice > 900000000
          ? "주택가격 9억 초과"
          : !isResidence
          ? "실거주 목적이 아님"
          : undefined,
      priority: 3,
    },
    {
      name: "청년 주택드림대출",
      maxAmount: 500000000,
      maxRate: 2.2,
      eligible: profile.age <= 39 && annualIncome <= 70000000 && isFirstTimeBuyer,
      eligibilityReason:
        profile.age > 39
          ? "만 40세 이상"
          : annualIncome > 70000000
          ? "연소득 7천만원 초과"
          : !isFirstTimeBuyer
          ? "생애최초 아님"
          : undefined,
      priority: 1,
    },
    {
      name: "신생아 특례대출",
      maxAmount: 500000000,
      maxRate: 1.6,
      eligible: annualIncome <= 130000000 && propertyPrice <= 900000000,
      eligibilityReason:
        annualIncome > 130000000
          ? "부부합산 소득 1.3억 초과"
          : propertyPrice > 900000000
          ? "주택가격 9억 초과"
          : "출산 가구 대상 (2023년 이후 출산)",
      priority: profile.dependents > 0 ? 1 : 4,
    },
  ];

  return loans.sort((a, b) => a.priority - b.priority);
}

export async function POST(req: NextRequest) {
  try {
    const profile: LoanProfile = await req.json();
    const metrics = calculateLoanMetrics(profile);
    const governmentLoans = getGovernmentLoans(profile);

    // AI로 개선사항 및 로드맵 생성
    const prompt = `당신은 주택담보대출 전문 상담사입니다. 다음 고객 정보를 분석하여 실행 가능한 개선 방안과 로드맵을 제공해주세요.

고객 정보:
- 나이: ${profile.age}세
- 직업: ${profile.occupation}
- 연소득: ${profile.annualIncome.toLocaleString()}원 ${profile.hasSpouse ? `(배우자 소득 포함 ${metrics.totalIncome.toLocaleString()}원)` : ""}
- 신용점수: ${profile.creditScore}점
- 매입 예정 지역: ${profile.targetRegion}
- 주택 가격: ${profile.propertyPrice.toLocaleString()}원
- 기존 대출: ${profile.existingLoan.toLocaleString()}원
- 자동차 할부: ${profile.carLoan.toLocaleString()}원
- 카드론: ${profile.cardLoan.toLocaleString()}원

분석 결과:
- DSR: ${metrics.dsr.toFixed(1)}%
- LTV: ${metrics.ltv.toFixed(1)}%
- 최대 대출 가능액: ${metrics.maxLoanAmount.toLocaleString()}원
- 승인 가능성: ${metrics.approvalProbability}점/100점

다음 JSON 형식으로 응답해주세요:
{
  "issues": [
    {"type": "문제 유형", "description": "구체적인 문제 설명", "severity": "high|medium|low"}
  ],
  "improvements": [
    {"action": "실행 가능한 개선 행동", "effect": "예상 효과", "estimatedIncrease": 숫자(원)}
  ],
  "roadmap": [
    {"step": 1, "title": "단계 제목", "description": "상세 설명", "duration": "소요 기간"}
  ]
}

issues는 실제 문제가 있는 경우만 포함 (없으면 빈 배열).
improvements는 3-5개.
roadmap은 8단계.
JSON만 반환하세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0].message.content ?? "";

    let aiResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch {
      aiResult = {
        issues: [],
        improvements: [],
        roadmap: [
          { step: 1, title: "신용점수 확인", description: "나이스지키미/올크레딧에서 신용점수 확인", duration: "1일" },
          { step: 2, title: "기존 부채 정리", description: "카드론, 할부금 상환 계획 수립", duration: "1-3개월" },
          { step: 3, title: "재직증명서 준비", description: "재직증명서, 건강보험료 납부확인서 준비", duration: "1주" },
          { step: 4, title: "소득 증빙 준비", description: "원천징수영수증, 근로소득 원천징수확인서", duration: "1주" },
          { step: 5, title: "사전심사 신청", description: "주요 시중은행 3곳 이상 사전심사", duration: "1-2주" },
          { step: 6, title: "매매계약 체결", description: "주택 선정 후 매매계약 진행", duration: "1-2주" },
          { step: 7, title: "본심사 진행", description: "사전심사 통과 은행에 본심사 신청", duration: "1-2주" },
          { step: 8, title: "대출 실행", description: "잔금일 대출 실행 및 소유권 이전", duration: "1일" },
        ],
      };
    }

    const result: LoanAnalysis = {
      ...metrics,
      ...aiResult,
      governmentLoans,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Loan analysis error:", error);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
