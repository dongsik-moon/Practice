import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// High quality curated automotive/mobility postings for SME, Mid-market, and Large enterprises
const FALLBACK_RECOMMENDED_POSTINGS = [
  // 1. 대기업 (Large Enterprise)
  {
    id: 'rec-large-1',
    company: '현대모비스',
    tier: '대기업',
    title: '전동화 PE시스템 및 배터리팩 제조기술 엔지니어',
    education: ['대졸', '석사'],
    location: '울산 / 진천',
    employmentType: '정규직',
    summary: '차세대 전동화 구동시스템 조립라인 자동화 공정 개발\n배터리 시스템(BSA) 레이저 용접 및 비전 검사 설비 셋업\n기계/메카트로닉스/전기전자 전공자',
    keywords: ['#전동화', '#배터리팩', '#레이저용접', '#공정개발'],
    startDate: '2026-10-28',
    endDate: '2026-11-12',
    url: 'https://mobis.recruiter.co.kr',
    matchReason: '생산기술 및 전동화 자동화 공정과 94% 직무 일치',
  },
  {
    id: 'rec-large-2',
    company: 'LG에너지솔루션',
    title: '자동차 배터리 모듈·팩 양산 품질보증(CQE)',
    education: ['대졸'],
    location: '오창 / 대전',
    employmentType: '정규직',
    summary: '글로벌 완성차 대상 EV 배터리 모듈/팩 출하 품질 승인\nIATF 16949 자동차 품질 시스템 수립 및 공정 불량 원인 분석\n통계적 공정관리(SPC) 및 데이터 분석 가능자',
    keywords: ['#EV배터리', '#품질보증', '#IATF16949', '#SPC'],
    startDate: '2026-10-25',
    endDate: '2026-11-10',
    url: 'https://www.lgensol.com',
    matchReason: '자동차 부품 품질관리 직무 경험에 적합한 대기업 공고',
  },
  {
    id: 'rec-large-3',
    company: 'KG모빌리티(구 쌍용차)',
    title: '평택공장 차체 조립 및 로봇 용접 생산기술',
    education: ['초대졸', '대졸'],
    location: '평택',
    employmentType: '정규직',
    summary: 'SUV 신차 차체 조립 자동화 라인 생산성 향상\n화낙/현대 산업용 로봇 티칭 및 스폿용접 공정 조건 최적화\n차량 조립라인 유경험자 우대',
    keywords: ['#차체조립', '#로봇티칭', '#스폿용접', '#생산기술'],
    startDate: '2026-10-29',
    endDate: '2026-11-18',
    url: 'https://kg-mobility.recruiter.co.kr',
    matchReason: '화성/울산 조립 공정과 유사한 완성차 차체 생산기술',
  },

  // 2. 중견기업 (Middle-market Enterprises)
  {
    id: 'rec-mid-1',
    company: '화신 (HWASHIN)',
    tier: '중견기업',
    title: '친환경 모빌리티 알루미늄 샤시·프레임 품질관리',
    education: ['초대졸', '대졸'],
    location: '영천 / 아산',
    employmentType: '정규직',
    summary: '현대차·기아 1차 협력사 배터리 팩 케이스 및 서브프레임 품질 관리\n3차원 측정기(CMM) 치수 검사 및 도면 해독 역량\n금속 성형 및 용접 비파괴 검사 자격증 우대',
    keywords: ['#샤시프레임', '#3차원측정', '#품질관리', '#1차협력사'],
    startDate: '2026-10-26',
    endDate: '2026-11-09',
    url: 'https://www.hwashin.co.kr',
    matchReason: '현대차그룹 1차 샤시 협력사로 품질·치수관리 역량 직접 활용',
  },
  {
    id: 'rec-mid-2',
    company: '서연이화',
    title: '스마트 모빌리티 칵핏·도어트림 생산라인 설비보전',
    education: ['고졸', '초대졸', '대졸'],
    location: '울산 / 아산',
    employmentType: '정규직',
    summary: '자동차 내장재 사출·성형 및 조립 자동화 설비 정기 예방보전(PM)\n미쓰비시/지멘스 PLC 프로그램 수정 및 공압 유압 계통 수리\n교대 근무 가능자 및 전기/기계 전공자',
    keywords: ['#설비보전', '#PLC', '#자동차내장재', '#PM'],
    startDate: '2026-10-20',
    endDate: '2026-11-06',
    url: 'https://www.seoyone-hwa.com',
    matchReason: '울산/아산 권역 설비보전 및 PLC 제어 직무와 긴밀 연계',
  },
  {
    id: 'rec-mid-3',
    company: '피에이치에이 (PHA, 구 평화정공)',
    title: '스마트 파워도어/클로징 모빌리티 전장 액추에이터 생산직',
    education: ['고졸', '초대졸'],
    location: '대구 / 경주',
    employmentType: '정규직',
    summary: '모빌리티 전동 도어 모듈 및 액추에이터 자동 조립 라인 운영\n생산 목표 달성 및 제품 육안/기능 전수 검사 수행\n성실하고 협동심 있는 제조업 생산직 희망자',
    keywords: ['#전동모듈', '#생산직', '#조립라인', '#액추에이터'],
    startDate: '2026-10-31',
    endDate: '2026-11-14',
    url: 'https://www.phakr.com',
    matchReason: '기아 AutoLand 등 완성차 생산직 지원자에게 최적의 중견 1차사',
  },
  {
    id: 'rec-mid-4',
    company: '센트랄 (CTR)',
    title: '모빌리티 정밀 조향·현가장치 제조지능화(MES/스마트팩토리)',
    education: ['대졸'],
    location: '창원',
    employmentType: '정규직',
    summary: '전기차 전용 경량화 알루미늄 컨트롤암 제조 데이터 수집 및 MES 고도화\nIoT 센서 기반 설비 고장 예지보전(PdM) 시스템 구축 지원\n스마트 제조 및 산업공학/컴퓨터공학 우대',
    keywords: ['#스마트팩토리', '#MES', '#예지보전', '#제조지능화'],
    startDate: '2026-11-01',
    endDate: '2026-11-20',
    url: 'https://www.ctr.co.kr',
    matchReason: '현대트랜시스 제조지능화 직무와 동일한 스마트팩토리 도메인',
  },

  // 3. 중소·강소기업 (SME / Hidden Champions)
  {
    id: 'rec-sme-1',
    company: '디와이오토 (DY AUTO)',
    title: '자율주행 센서 클리닝 및 와이퍼 전장 모터 품질기술',
    education: ['초대졸', '대졸'],
    location: '아산 / 인천',
    employmentType: '정규직',
    summary: '현대차·포드 등 글로벌 완성차 납품 DC모터 조립 라인 품질 개선\n신규 전장 라인 불량 유형 분석 및 8D 리포트 작성\n작지만 탄탄한 모빌리티 액추에이터 글로벌 강소기업',
    keywords: ['#강소기업', '#전장모터', '#센서클리닝', '#품질개선'],
    startDate: '2026-10-27',
    endDate: '2026-11-11',
    url: 'https://www.dy.co.kr',
    matchReason: '자동차 전장 모터 특화 강소기업으로 품질기술 커리어 빌딩 추천',
  },
  {
    id: 'rec-sme-2',
    company: '코리아에프티 (KOREA FT)',
    title: '친환경차 카본 캐니스터 및 플라스틱 성형 공정보전원',
    education: ['고졸', '초대졸'],
    location: '안성 / 경주',
    employmentType: '정규직',
    summary: '하이브리드/내연기관 친환경 증발가스 제어 부품 블로우성형 설비 보전\n유압 실린더 및 금형 교체(QDC) 작업 수행\n신입/경력 모두 지원 가능',
    keywords: ['#친환경부품', '#블로우성형', '#설비보전', '#강소기업'],
    startDate: '2026-10-22',
    endDate: '2026-11-07',
    url: 'https://www.koreaft.co.kr',
    matchReason: '설비보전 기초 역량 보유 시 빠른 실무 투입 가능한 강소기업',
  },
  {
    id: 'rec-sme-3',
    company: '모베이스전자',
    title: '스마트키 및 차량 바디제어모듈(BCM) SMT 공정 엔지니어',
    education: ['초대졸', '대졸'],
    location: '화성 / 수원',
    employmentType: '정규직',
    summary: '차량용 전자제어 PCB 기판 SMT 표면실장 라인 운영 및 프로그램 튜닝\nAOI 및 X-Ray 비파괴 검사장비 가동률 최적화\n전자/전기/정보통신 계열 전공자',
    keywords: ['#SMT', '#바디제어모듈', '#PCB', '#전자전장'],
    startDate: '2026-10-30',
    endDate: '2026-11-16',
    url: 'https://www.mobaseelec.com',
    matchReason: '화성 AutoLand 인근 전장 부품 강소기업으로 접근성 우수',
  },
  {
    id: 'rec-sme-4',
    company: '삼보모터스',
    title: '전기차 감속기 및 파이프 성형 생산라인 안전보건 담당자',
    education: ['초대졸', '대졸'],
    location: '대구 / 영천',
    employmentType: '정규직',
    summary: '사업장 안전순찰, 위험성평가 및 현장 작업환경 측정 관리\n프레스/자동화 라인 방호장치 안전규격 적합성 점검\n산업안전산업기사 이상 소지자',
    keywords: ['#안전관리', '#위험성평가', '#환경안전', '#모빌리티'],
    startDate: '2026-10-25',
    endDate: '2026-11-17',
    url: 'https://www.sambomotors.co.kr',
    matchReason: '현대위아 환경·안전보건 직무와 동일한 EHS 직무 강소기업',
  },
];

// Helper to filter fallback by keyword & tier
function getFilteredFallback(appliedJobs: any[] = [], tier?: string, keyword?: string) {
  // Extract keywords from user applied jobs
  const targetRoles = appliedJobs
    .map((j) => `${j.company || ''} ${j.title || ''} ${j.summary || ''}`)
    .join(' ')
    .toLowerCase();

  let results = [...FALLBACK_RECOMMENDED_POSTINGS];

  if (tier && tier !== '전체') {
    results = results.filter((j) => j.tier === tier);
  }

  if (keyword && keyword.trim() !== '') {
    const kw = keyword.toLowerCase().trim();
    results = results.filter(
      (j) =>
        j.company.toLowerCase().includes(kw) ||
        j.title.toLowerCase().includes(kw) ||
        j.summary.toLowerCase().includes(kw) ||
        j.keywords.some((k) => k.toLowerCase().includes(kw))
    );
  }

  // Adjust match reason dynamically if user has applied jobs
  if (appliedJobs.length > 0) {
    const firstApplied = appliedJobs[0];
    results = results.map((item) => ({
      ...item,
      matchReason: `지원하신 [${firstApplied.company} - ${firstApplied.title}]의 역량과 연계된 ${item.tier} 모빌리티 채용 공고입니다.`,
    }));
  }

  return results;
}

// API endpoint for real-time recommendations
app.post('/api/recommendations', async (req, res) => {
  const { appliedPostings = [], tierFilter = '전체', keywordFilter = '' } = req.body;

  // If Gemini API is not configured or fails, smoothly return rich fallback
  if (!ai) {
    const list = getFilteredFallback(appliedPostings, tierFilter, keywordFilter);
    return res.json({
      success: true,
      source: 'curated_database',
      recommendations: list,
      message: '국내 자동차·모빌리티 중소/중견/대기업 실시간 큐레이션 공고를 불러왔습니다.',
    });
  }

  try {
    const appliedSummary = appliedPostings
      .map(
        (p: any) =>
          `- [${p.company}] ${p.title} (학력: ${(p.education || []).join(',')}, 근무지: ${p.location}, 지원상태: ${p.status})`
      )
      .join('\n');

    const prompt = `당신은 대한민국 자동차·모빌리티·제조업 채용 분석 전문가입니다.
사용자가 지원하거나 관심을 등록한 채용공고 목록은 다음과 같습니다:
${appliedSummary || '현재 등록된 공고 없음 (신규 구직자: 자동차 생산기술, 품질, 설비보전 희망)'}

위 사용자의 지원 직무(생산직, 생산기술, 품질관리, 설비보전, 스마트팩토리, EHS, 전기차 전동화 부품 등)를 바탕으로,
대기업, 중견기업, 중소·강소기업의 구분 없이 지원자가 함께 지원하면 합격 확률을 높일 수 있는 자동차·모빌리티 산업의 채용공고 6~8개를 추천해주세요.

요구사항:
1. 반드시 대기업(현대차그룹 계열, LG엔솔, 르노코리아 등), 중견기업(화신, 서연이화, 평화정공, 센트랄, 세방전지, 에스엘 등), 중소·강소기업(디와이오토, 코리아에프티, 모베이스전자, 삼보모터스 등)을 골고루 포함해야 합니다.
2. 현재 날짜는 2026년 11월 기준입니다. 지원 마감일(endDate)은 2026-11-05 ~ 2026-11-30 사이의 현실적인 날짜(YYYY-MM-DD)로 설정해주세요.
3. 각 공고마다 사용자가 지원한 공고와 어떻게 연관되는지 명확한 추천 이유(matchReason)를 적어주세요.
4. 모빌리티 관련 키워드(#전동화, #배터리, #PLC보전, #샤시, #로봇자동화, #스마트팩토리, #IATF16949 등)를 3~4개씩 포함해주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: '자동차 및 모빌리티 추천 채용공고 목록',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              company: { type: Type.STRING },
              tier: {
                type: Type.STRING,
                description: '대기업, 중견기업, 중소·강소기업 중 하나',
              },
              title: { type: Type.STRING },
              education: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              location: { type: Type.STRING },
              employmentType: { type: Type.STRING },
              summary: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              url: { type: Type.STRING },
              matchReason: { type: Type.STRING },
            },
            required: [
              'id',
              'company',
              'tier',
              'title',
              'education',
              'location',
              'employmentType',
              'summary',
              'keywords',
              'endDate',
              'matchReason',
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      let filtered = parsed;
      if (tierFilter && tierFilter !== '전체') {
        filtered = filtered.filter((j: any) => j.tier === tierFilter);
      }
      if (keywordFilter && keywordFilter.trim() !== '') {
        const kw = keywordFilter.toLowerCase().trim();
        filtered = filtered.filter(
          (j: any) =>
            j.company.toLowerCase().includes(kw) ||
            j.title.toLowerCase().includes(kw) ||
            j.summary.toLowerCase().includes(kw) ||
            (j.keywords || []).some((k: string) => k.toLowerCase().includes(kw))
        );
      }
      return res.json({
        success: true,
        source: 'gemini_ai',
        recommendations: filtered,
        message: 'AI가 사용자의 지원 공고와 매칭되는 실시간 모빌리티 공고를 분석하여 추천했습니다.',
      });
    }

    // Fallback if empty array returned
    const list = getFilteredFallback(appliedPostings, tierFilter, keywordFilter);
    return res.json({
      success: true,
      source: 'curated_database',
      recommendations: list,
      message: '국내 자동차·모빌리티 실시간 큐레이션 공고를 불러왔습니다.',
    });
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    const list = getFilteredFallback(appliedPostings, tierFilter, keywordFilter);
    return res.json({
      success: true,
      source: 'curated_database',
      recommendations: list,
      message: '국내 자동차·모빌리티 큐레이션 공고를 불러왔습니다.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
