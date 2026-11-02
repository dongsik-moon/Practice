import { JobPosting } from '../types/job';

const STORAGE_KEY = 'career_calendar_job_postings_v1';

export const INITIAL_DEMO_POSTINGS: JobPosting[] = [
  {
    id: 'demo-1',
    company: '현대자동차',
    tier: '대기업',
    title: '울산공장 차량제조/전동화 생산기술 신입 채용',
    education: ['대졸', '석사'],
    location: '울산',
    employmentType: '정규직',
    summary: '전동화 파워트레인 조립라인 신공법 검토 및 설비 셋업\n로봇 자동화 공정 최적화 및 스마트 제조 시스템 운영\n기계/전기전자/산업공학 전공자 우대',
    keywords: ['#전동화', '#생산기술', '#로봇자동화'],
    startDate: '2026-10-25',
    endDate: '2026-11-08',
    url: 'https://talent.hyundai.com',
    isFavorite: true,
    status: '지원 준비 중',
    isDemo: true,
    createdAt: '2026-10-25T09:00:00Z',
    updatedAt: '2026-10-25T09:00:00Z',
  },
  {
    id: 'demo-2',
    company: '기아',
    tier: '대기업',
    title: 'AutoLand 화성 PBV 스마트 제조 생산직(모빌리티 제조)',
    education: ['고졸', '초대졸', '대졸'],
    location: '화성',
    employmentType: '정규직',
    summary: '친환경 맞춤형 PBV 신공장 차체·도장·조립 공정 수행\n품질 검사 및 자동화 로봇 제조 설비 1차 일상 점검\n교대 근무 가능자 및 제조업 현장 유경험자 우대',
    keywords: ['#PBV', '#스마트제조', '#생산직', '#차체조립'],
    startDate: '2026-10-20',
    endDate: '2026-11-05',
    url: 'https://career.kia.com',
    isFavorite: true,
    status: '관심 공고',
    isDemo: true,
    createdAt: '2026-10-20T09:00:00Z',
    updatedAt: '2026-10-20T09:00:00Z',
  },
  {
    id: 'demo-3',
    company: '현대모비스',
    tier: '대기업',
    title: '전동화 핵심부품(배터리/구동모터) 품질보증 엔지니어',
    education: ['대졸'],
    location: '진천 / 의왕',
    employmentType: '정규직',
    summary: '배터리 시스템(BSA) 및 구동모터(PE) 신제품 양산 품질 승인\nIATF 16949 자동차 품질경영시스템 표준 관리\n글로벌 완성차 고객사 품질 이슈 신속 대응 및 공정 개선',
    keywords: ['#배터리시스템', '#품질보증', '#IATF16949'],
    startDate: '2026-10-28',
    endDate: '2026-11-15',
    url: 'https://mobis.recruiter.co.kr',
    isFavorite: false,
    status: '관심 공고',
    isDemo: true,
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'demo-4',
    company: 'HL만도',
    tier: '중견기업',
    title: '자율주행 x-by-Wire 스마트 섀시 설비보전 엔지니어',
    education: ['초대졸', '대졸'],
    location: '평택 / 원주',
    employmentType: '정규직',
    summary: '차세대 전자제어 조향/제동 자동화 라인 설비 예방보전(PM)\nPLC 제어 프로그래밍 및 비전 검사 시스템 트러블슈팅\n전기기사/산업기사 자격증 보유자 우대',
    keywords: ['#자율주행', '#섀시설비보전', '#PLC', '#자동화'],
    startDate: '2026-10-15',
    endDate: '2026-11-01',
    url: 'https://mando.recruiter.co.kr',
    isFavorite: true,
    status: '지원 완료',
    isDemo: true,
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'demo-5',
    company: '현대트랜시스',
    tier: '대기업',
    title: '파워트레인 제조지능화·스마트팩토리 기획 및 운영',
    education: ['대졸', '석사'],
    location: '서산',
    employmentType: '정규직',
    summary: '생산 빅데이터 기반 제조 공정 이상 사전 감지 알고리즘 구축\n스마트 공장 디지털 트윈 및 MES 공정 물류 최적화\n데이터 분석 툴(Python, SQL) 활용 가능자',
    keywords: ['#스마트팩토리', '#제조지능화', '#MES', '#디지털트윈'],
    startDate: '2026-11-01',
    endDate: '2026-11-25',
    url: 'https://hyundai-transys.recruiter.co.kr',
    isFavorite: false,
    status: '지원 준비 중',
    isDemo: true,
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
  },
  {
    id: 'demo-6',
    company: '현대위아',
    tier: '대기업',
    title: '자동차 부품 제조사업장 환경·안전보건(EHS) 관리자',
    education: [], // 학력 미지정 -> '학력 확인 필요'
    location: '창원',
    employmentType: '정규직',
    summary: '중대재해처벌법 및 산업안전보건법 컴플라이언스 총괄 점검\n공장 내 유해·위험요인 위험성평가 실시 및 안전문화 조성\n산업안전기사 또는 대기환경기사 자격 보유자',
    keywords: ['#환경안전', '#EHS', '#위험성평가'],
    startDate: '2026-10-30',
    endDate: '', // 마감일 미정
    url: '', // 공고 링크 등록 필요
    isFavorite: false,
    status: '관심 공고',
    isDemo: true,
    createdAt: '2026-10-30T09:00:00Z',
    updatedAt: '2026-10-30T09:00:00Z',
  },
];

export const storageService = {
  loadPostings(): JobPosting[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.savePostings(INITIAL_DEMO_POSTINGS);
        return INITIAL_DEMO_POSTINGS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        this.savePostings(INITIAL_DEMO_POSTINGS);
        return INITIAL_DEMO_POSTINGS;
      }
      return parsed;
    } catch (error) {
      console.error('Failed to load job postings from localStorage:', error);
      return INITIAL_DEMO_POSTINGS;
    }
  },

  savePostings(postings: JobPosting[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postings));
    } catch (error) {
      console.error('Failed to save job postings to localStorage:', error);
    }
  },

  resetToDemo(): JobPosting[] {
    this.savePostings(INITIAL_DEMO_POSTINGS);
    return INITIAL_DEMO_POSTINGS;
  },

  clearAll(): JobPosting[] {
    this.savePostings([]);
    return [];
  },
};
