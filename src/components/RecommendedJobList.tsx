import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  RefreshCw,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Tag,
  Lightbulb,
} from 'lucide-react';
import { RecommendedJob, CompanyTier, JobPosting } from '../types/job';
import { calculateDDay } from '../utils/dateUtils';

interface RecommendedJobListProps {
  recommendations: RecommendedJob[];
  isLoading: boolean;
  onRefresh: (tier?: string, keyword?: string) => void;
  onAddToCalendar: (rec: RecommendedJob) => void;
  savedPostings: JobPosting[];
  appliedPostingsCount: number;
}

const TIER_FILTERS: (CompanyTier | '전체')[] = ['전체', '대기업', '중견기업', '중소·강소기업'];

const POPULAR_MOBILITY_KEYWORDS = [
  '#전체',
  '#전동화',
  '#배터리',
  '#생산기술',
  '#품질관리',
  '#설비보전',
  '#스마트팩토리',
];

export const RecommendedJobList: React.FC<RecommendedJobListProps> = ({
  recommendations,
  isLoading,
  onRefresh,
  onAddToCalendar,
  savedPostings,
  appliedPostingsCount,
}) => {
  const [activeTier, setActiveTier] = useState<CompanyTier | '전체'>('전체');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('#전체');

  // Check if a recommended job is already added to saved postings
  const isJobAlreadyAdded = (rec: RecommendedJob) => {
    return savedPostings.some(
      (p) => p.company.trim() === rec.company.trim() && p.title.trim() === rec.title.trim()
    );
  };

  // Filter recommendations by tier and keyword
  const filteredList = React.useMemo(() => {
    return recommendations.filter((item) => {
      if (activeTier !== '전체' && item.tier !== activeTier) return false;
      if (selectedKeyword !== '#전체') {
        const kw = selectedKeyword.replace('#', '').toLowerCase();
        const matchesInTitle = item.title.toLowerCase().includes(kw);
        const matchesInSummary = item.summary.toLowerCase().includes(kw);
        const matchesInKeywords = item.keywords.some((k) =>
          k.toLowerCase().includes(kw)
        );
        if (!matchesInTitle && !matchesInSummary && !matchesInKeywords) return false;
      }
      return true;
    });
  }, [recommendations, activeTier, selectedKeyword]);

  const getTierBadgeStyle = (tier: CompanyTier) => {
    switch (tier) {
      case '대기업':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '중견기업':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '중소·강소기업':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Informational Guidance Ribbon */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 border border-blue-200/80 rounded-xl text-xs text-slate-700 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 leading-snug">
              실시간 지원 기반 모빌리티 채용 추천
            </p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              사용자님이 관심/지원 등록한 {appliedPostingsCount > 0 ? `${appliedPostingsCount}개 공고` : '제조업 직무'}의
              핵심 자격(생산직, 생산기술, 품질, 설비보전, 스마트제조 등)과 일치하는 공고를
              <span className="font-bold text-slate-900"> 중소·중견·대기업 구분 없이</span> 함께 제공합니다.
            </p>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRefresh(activeTier, selectedKeyword !== '#전체' ? selectedKeyword : undefined)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg shadow-2xs transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? '분석 중...' : '실시간 갱신'}</span>
          </button>
        </div>
      </div>

      {/* Enterprise Tier & Keyword Filter Bars */}
      <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">기업 규모:</span>
          {TIER_FILTERS.map((tier) => {
            const count =
              tier === '전체'
                ? recommendations.length
                : recommendations.filter((r) => r.tier === tier).length;
            const active = activeTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(tier)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tier} <span className="text-[10px] opacity-80 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Mobility Keywords */}
        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-200/60">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">키워드:</span>
          {POPULAR_MOBILITY_KEYWORDS.map((kw) => {
            const active = selectedKeyword === kw;
            return (
              <button
                key={kw}
                type="button"
                onClick={() => setSelectedKeyword(kw)}
                className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                  active
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {kw}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Job Cards List */}
      <div className="space-y-3.5">
        {filteredList.length > 0 ? (
          filteredList.map((job) => {
            const dday = calculateDDay(job.endDate);
            const isAdded = isJobAlreadyAdded(job);

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all relative"
              >
                {/* Header: Company + Tier Badge + Education on Left, D-Day on Right */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        {job.company}
                      </h4>

                      {/* Tier Badge */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getTierBadgeStyle(
                          job.tier
                        )}`}
                      >
                        {job.tier}
                      </span>

                      {/* Education Badges */}
                      <div className="flex items-center gap-1">
                        {job.education && job.education.length > 0 ? (
                          job.education.map((edu) => (
                            <span
                              key={edu}
                              className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70"
                            >
                              {edu}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            학력 확인 필요
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* D-Day Badge */}
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium border tabular-nums ${
                        dday.isUrgent
                          ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{dday.formattedDeadline}</span>
                    </span>
                  </div>
                </div>

                {/* Match Reason Banner */}
                <div className="mb-2.5 px-2.5 py-1.5 bg-blue-50/60 border border-blue-100 rounded-md text-[11px] text-blue-900 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{job.matchReason}</span>
                </div>

                {/* Job Title & Meta */}
                <div className="mb-2.5">
                  <h5 className="text-sm font-semibold text-slate-900 mb-1.5">{job.title}</h5>

                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      근무지: {job.location}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {job.employmentType}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 border border-slate-100 rounded-lg p-2.5 whitespace-pre-line">
                    <span className="font-semibold text-slate-700">공고 요약: </span>
                    {job.summary}
                  </div>
                </div>

                {/* Keywords */}
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  {job.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Actions: Add to Calendar and View Notice */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isAdded}
                    onClick={() => onAddToCalendar(job)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors shadow-2xs ${
                      isAdded
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                        : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-300'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>캘린더 등록됨</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>내 캘린더에 추가</span>
                      </>
                    )}
                  </button>

                  {job.url && job.url.trim() !== '' ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-2xs"
                    >
                      <span>채용공고 확인</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed text-center"
                    >
                      공고 링크 등록 필요
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-1">
              선택한 조건의 추천 공고가 없습니다.
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              기업 규모나 키워드 필터를 변경해보세요.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTier('전체');
                setSelectedKeyword('#전체');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
