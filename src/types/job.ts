export type EducationLevel = '고졸' | '초대졸' | '대졸' | '석사';

export type CompanyTier = '대기업' | '중견기업' | '중소·강소기업';

export type ApplicationStatus =
  | '관심 공고'
  | '지원 준비 중'
  | '지원 완료'
  | '서류 합격'
  | '불합격'
  | '최종 합격';

export interface JobPosting {
  id: string;
  company: string; // 회사명 (필수)
  title: string; // 모집 직무 (필수)
  education: EducationLevel[]; // 학력 조건 (복수 허용, 비어있으면 '학력 확인 필요')
  location: string; // 근무 지역
  employmentType: string; // 채용 형태 (예: 정규직, 계약직 등)
  summary: string; // 공고 요약 및 핵심 지원 자격 (3~4줄)
  startDate?: string; // 지원 시작일 (YYYY-MM-DD)
  endDate?: string; // 지원 마감일 (YYYY-MM-DD, 없으면 '마감일 미정')
  url?: string; // 공식 채용공고 URL
  isFavorite: boolean; // 관심 기업 여부
  status: ApplicationStatus; // 지원 상태
  tier?: CompanyTier; // 기업 규모 구분
  keywords?: string[]; // 모빌리티/제조 키워드
  isDemo?: boolean; // 가상 공고 여부 (데모 데이터 표시)
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedJob {
  id: string;
  company: string;
  tier: CompanyTier;
  title: string;
  education: EducationLevel[];
  location: string;
  employmentType: string;
  summary: string;
  keywords: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  matchReason: string;
  isAddedToCalendar?: boolean;
}

export interface DDayInfo {
  label: string; // e.g. "D-3", "D-DAY", "마감", "마감일 미정"
  formattedDeadline: string; // e.g. "11월 15일 마감 · D-3"
  daysRemaining: number | null; // 양수: 남은 일수, 0: 당일, 음수: 지남, null: 미정
  isUrgent: boolean; // 7일 이하 또는 D-DAY
  isToday: boolean;
  isExpired: boolean;
}

