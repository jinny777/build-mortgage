-- Mortgage AI Planner 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 사용자 테이블 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 유튜브 영상 분석 기록
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  video_id TEXT,
  title TEXT,
  transcript TEXT,
  summary TEXT,
  key_points TEXT[],
  loan_strategies TEXT[],
  warnings TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_video_id ON youtube_videos(video_id);

-- 대출 프로필
CREATE TABLE IF NOT EXISTS loan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  income BIGINT NOT NULL,
  credit_score INTEGER NOT NULL,
  existing_loan BIGINT DEFAULT 0,
  profile_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 대출 분석 보고서
CREATE TABLE IF NOT EXISTS loan_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES loan_profiles(id) ON DELETE SET NULL,
  result JSONB NOT NULL,
  roadmap JSONB[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_reports ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용 (유튜브 분석은 캐시 목적)
CREATE POLICY "Public can read youtube_videos" ON youtube_videos
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert youtube_videos" ON youtube_videos
  FOR INSERT WITH CHECK (true);
