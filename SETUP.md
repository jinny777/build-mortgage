# Mortgage AI Planner 실행 가이드

## 1. API 키 설정

`.env.local` 파일에 다음 값을 입력하세요:

### Anthropic (Claude) API 키
1. https://console.anthropic.com 접속
2. API Keys → Create Key
3. `ANTHROPIC_API_KEY=sk-ant-...` 입력

### Supabase 설정 (선택사항 - DB 저장 원하는 경우)
1. https://supabase.com 에서 새 프로젝트 생성
2. Settings → API에서 URL과 anon key 복사
3. SQL Editor에서 `supabase-schema.sql` 실행

## 2. 개발 서버 실행

```bash
cd mortgage-ai-planner
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 3. 주요 페이지

| 경로 | 기능 |
|------|------|
| `/` | 메인 홈 |
| `/analyze` | 유튜브 영상 분석 |
| `/profile` | 대출 프로필 입력 (3단계) |
| `/report` | 대출 분석 보고서 + PDF 다운로드 |
| `/chat` | AI 대출 상담 챗봇 |

## 4. 참고사항

- 유튜브 영상 분석은 자막이 있는 영상만 지원됩니다
- 대출 계산은 추정치이며 실제 금융기관 심사와 다를 수 있습니다
- PDF 다운로드는 `/report` 페이지에서 가능합니다
