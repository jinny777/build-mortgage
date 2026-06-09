import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `당신은 주택담보대출 전문 AI 상담사입니다. 한국 주택담보대출 시장에 정통하며 친절하고 명확하게 설명합니다.

전문 분야:
- LTV, DTI, DSR 계산 및 설명
- 신용점수 관리 및 대출 승인 전략
- 정부 정책대출 (디딤돌, 보금자리론, 특례보금자리론, 신생아특례, 청년 주택드림)
- 은행별 금리 비교 및 조건
- 대출 서류 준비 방법
- 부동산 취득 관련 세금 (취득세, 양도세 등)

응답 원칙:
1. 한국어로 답변
2. 구체적인 수치와 기준을 제시
3. 복잡한 내용은 단계별로 설명
4. 개인 상황에 맞는 실용적 조언 제공
5. 필요 시 전문 상담(금융기관, 세무사)을 권유
6. 2026년 현행 규제 기준으로 답변 (DSR 40%, 스트레스 DSR 포함)

응답은 간결하되 완전해야 합니다. 마크다운을 활용해 가독성을 높이세요.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "메시지가 필요합니다." }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const message = completion.choices[0].message.content ?? "";
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "답변 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
