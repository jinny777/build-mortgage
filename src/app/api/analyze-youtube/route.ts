import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";
import { extractYoutubeId } from "@/lib/utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { url, manualTranscript } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    const videoId = extractYoutubeId(url);
    if (!videoId) {
      return NextResponse.json({ error: "유효한 유튜브 URL이 아닙니다." }, { status: 400 });
    }

    // YouTube oEmbed로 제목 가져오기
    let title = "";
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title;
      }
    } catch {
      title = "제목 없음";
    }

    // 자막 추출 (사용자가 직접 붙여넣은 자막이 있으면 우선 사용)
    let transcript = "";
    if (manualTranscript && manualTranscript.trim().length > 0) {
      transcript = manualTranscript.trim();
    } else {
      try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: "ko",
        });
        transcript = transcriptData.map((t) => t.text).join(" ");
      } catch {
        try {
          const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
          transcript = transcriptData.map((t) => t.text).join(" ");
        } catch {
          return NextResponse.json(
            {
              error:
                "이 영상의 자막을 자동으로 가져올 수 없습니다. 아래에 자막 텍스트를 직접 붙여넣어 주세요.",
              videoId,
              title,
              needsManualTranscript: true,
            },
            { status: 422 }
          );
        }
      }
    }

    // OpenAI API로 분석
    const prompt = `당신은 주택담보대출 전문 AI 분석가입니다. 아래 유튜브 영상 자막을 분석하여 주담대 관련 핵심 정보를 추출해주세요.

영상 제목: ${title}

자막 내용:
${transcript.slice(0, 8000)}

다음 JSON 형식으로 분석 결과를 제공해주세요:
{
  "summary": "3줄 요약 (각 줄은 \\n으로 구분)",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3", "핵심 포인트 4", "핵심 포인트 5"],
  "loanStrategies": ["영상에서 언급된 대출 전략 1", "대출 전략 2", "대출 전략 3"],
  "warnings": ["주의사항 1", "주의사항 2", "주의사항 3"]
}

분석 시 다음에 집중하세요:
- DSR, DTI, LTV 관련 정보
- 신용점수 관리 방법
- 소득 증빙 방법
- 금리 관련 정보
- 정부 정책대출 정보
- 대출 심사 통과 전략

JSON만 반환하고 다른 텍스트는 포함하지 마세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = completion.choices[0].message.content ?? "";

    let analysisResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch {
      throw new Error("AI 응답 파싱 실패");
    }

    return NextResponse.json({
      videoId,
      title,
      url,
      transcript: transcript.slice(0, 500),
      ...analysisResult,
    });
  } catch (error) {
    console.error("YouTube analysis error:", error);
    const message = error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
