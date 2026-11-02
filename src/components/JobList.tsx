import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Briefcase,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { JobPosting, ApplicationStatus, EducationLevel, RecommendedJob } from '../types/job';
import { JobNoticeCard } from './JobNoticeCard';
import { RecommendedJobList } from './RecommendedJobList';
import { formatKoreanDate } from '../utils/dateUtils';

interface JobListProps {
  postings: JobPosting[];
  selectedDate?: string;
  selectedMonthLabel: string;
  isUndeterminedActive?: boolean;
  onClearDateFilter: () => void;
  onOpenAddModal: (defaultDate?: string) => void;
  onOpenEditModal: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
  onToggleFavorite: (jobId: string) => void;
  onChangeStatus: (jobId: string, status: ApplicationStatus) => void;
  onHoverJobDate?: (dateString?: string) => void;
  onSelectJob?: (job: JobPosting) => void;
  onResetToDemo: () => void;

  // Recommendations
  recommendations: RecommendedJob[];
  isRecommendationsLoading: boolean;
  onRefreshRecommendations: (tier?: string, keyword?: string) => void;
  onAddRecommendedToCalendar: (rec: RecommendedJob) => void;
  activeTab: 'my-jobs' | 'recommendations';
  onChangeActiveTab: (tab: 'my-jobs' | 'recommendations') => void;
}

const STATUS_FILTERS: (ApplicationStatus | '전체')[] = [
  '전체',
  '관심 공고',
  '지원 준비 중',
  '지원 완료',
  '서류 합격',
  '최종 합격',
];

const EDUCATION_FILTERS: (EducationLevel | '전체')[] = [
  '전체',
  '고졸',
  '초대졸',
  '대졸',
  '석사',
];

export const JobList: React.FC<JobListProps> = ({
  postings,
  selectedDate,
  selectedMonthLabel,
  isUndeterminedActive,
  onClearDateFilter,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteJob,
  onToggleFavorite,
  onChangeStatus,
  onHoverJobDate,
  onSelectJob,
  onResetToDemo,
  recommendations,
  isRecommendationsLoading,
  onRefreshRecommendations,
  onAddRecommendedToCalendar,
  activeTab,
  onChangeActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | '전체'>('전체');
  const [educationFilter, setEducationFilter] = useState<EducationLevel | '전체'>('전체');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Apply all filters for user's registered postings
  const filteredPostings = React.useMemo(() => {
    return postings.filter((job) => {
      // 1. Date filter (if selectedDate active)
      if (selectedDate) {
        if (job.endDate !== selectedDate) return false;
      }

      // 2. Undetermined filter (if undetermined tab active)
      if (isUndeterminedActive) {
        if (job.endDate && job.endDate.trim() !== '') return false;
      }

      // 3. Search query (company, title, location, summary)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesLocation = job.location.toLowerCase().includes(q);
        const matchesSummary = job.summary.toLowerCase().includes(q);
        if (!matchesCompany && !matchesTitle && !matchesLocation && !matchesSummary) {
          return false;
        }
      }

      // 4. Status filter
      if (statusFilter !== '전체' && job.status !== statusFilter) {
        return false;
      }

      // 5. Education filter
      if (educationFilter !== '전체') {
        if (!job.education || !job.education.includes(educationFilter)) {
          return false;
        }
      }

      // 6. Favorites
      if (onlyFavorites && !job.isFavorite) {
        return false;
      }

      return true;
    });
  }, [
    postings,
    selectedDate,
    isUndeterminedActive,
    searchQuery,
    statusFilter,
    educationFilter,
    onlyFavorites,
  ]);

  const hasAnyFilterActive =
    searchQuery.trim() !== '' ||
    statusFilter !== '전체' ||
    educationFilter !== '전체' ||
    onlyFavorites;

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('전체');
    setEducationFilter('전체');
    setOnlyFavorites(false);
  };

  // Header period text
  const currentViewTitle = selectedDate
    ? `${formatKoreanDate(selectedDate)} 마감 공고`
    : isUndeterminedActive
    ? '마감일 미정 채용공고'
    : `${selectedMonthLabel} 기준 공고`;

  const appliedJobsCount = postings.filter(
    (p) =>
      p.status === '지원 완료' ||
      p.status === '지원 준비 중' ||
      p.status === '서류 합격' ||
      p.status === '최종 합격'
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Top Header of Job List */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
        {/* Title & Top Action */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">채용공고</h2>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-200/60 tabular-nums">
                {activeTab === 'my-jobs' ? `총 ${filteredPostings.length}건` : `추천 ${recommendations.length}건`}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeTab === 'my-jobs' ? currentViewTitle : '실시간 모빌리티 맞춤 탐색'}</span>
            </p>
          </div>

          {/* Add Job Notice Primary Button */}
          <button
            type="button"
            onClick={() => onOpenAddModal(selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>공고 추가</span>
          </button>
        </div>

        {/* Tab Switcher: My Postings vs Real-time Mobility Recommendations */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl mb-3">
          <button
            type="button"
            onClick={() => onChangeActiveTab('my-jobs')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my-jobs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>내 캘린더 공고</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 tabular-nums font-semibold">
              {postings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeActiveTab('recommendations')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>실시간 모빌리티 추천</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 tabular-nums font-semibold">
              대·중견·중소
            </span>
          </button>
        </div>

        {/* Filters specific to "내 캘린더 공고" */}
        {activeTab === 'my-jobs' && (
          <>
            {/* Date Filter Alert Ribbon (When user clicked a date in calendar) */}
            {(selectedDate || isUndeterminedActive) && (
              <div className="flex items-center justify-between p-2 px-3 mb-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-900">
                <span className="font-medium">
                  {selectedDate
                    ? `📅 ${formatKoreanDate(selectedDate)} 마감 공고만 필터링되어 있습니다.`
                    : '⏳ 마감일 미정 공고를 조회 중입니다.'}
                </span>
                <button
                  type="button"
                  onClick={onClearDateFilter}
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline px-1.5 py-0.5 rounded ml-2"
                >
                  <span>전체 공고 보기</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Search & Filter Controls */}
            <div className="space-y-2.5">
              {/* Search Input Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="기업명, 직무(생산기술·품질·설비 등), 지역 검색..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter row: Status, Education, Favorites */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Status Select */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">상태:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {STATUS_FILTERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Education Select */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">학력:</span>
                    <select
                      value={educationFilter}
                      onChange={(e) => setEducationFilter(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {EDUCATION_FILTERS.map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Favorites toggle */}
                  <button
                    type="button"
                    onClick={() => setOnlyFavorites(!onlyFavorites)}
                    className={`px-2 py-1 rounded border text-xs font-medium transition-colors ${
                      onlyFavorites
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ★ 관심 공고만
                  </button>
                </div>

                {hasAnyFilterActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-250px)] min-h-[400px]">
        {activeTab === 'recommendations' ? (
          <RecommendedJobList
            recommendations={recommendations}
            isLoading={isRecommendationsLoading}
            onRefresh={onRefreshRecommendations}
            onAddToCalendar={onAddRecommendedToCalendar}
            savedPostings={postings}
            appliedPostingsCount={appliedJobsCount}
          />
        ) : filteredPostings.length > 0 ? (
          filteredPostings.map((job) => (
            <JobNoticeCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              onHover={onHoverJobDate}
              onEdit={onOpenEditModal}
              onDelete={onDeleteJob}
              onToggleFavorite={onToggleFavorite}
              onChangeStatus={onChangeStatus}
            />
          ))
        ) : (
          /* Empty States for My Postings */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200 mb-3 shadow-xs">
              <Briefcase className="w-6 h-6 text-slate-400" />
            </div>

            {selectedDate ? (
              <>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">
                  해당 날짜에 마감되는 채용공고가 없습니다.
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  선택하신 날짜({formatKoreanDate(selectedDate)})에는 마감 일정이 없습니다.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClearDateFilter}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
                  >
                    전체 공고 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAddModal(selectedDate)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
                  >
                    이 날짜에 공고 추가
                  </button>
                </div>
              </>
            ) : hasAnyFilterActive ? (
              <>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">
                  검색 조건에 맞는 공고가 없습니다.
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  검색어 또는 필터 조건을 변경하거나 초기화해보세요.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
                >
                  필터 초기화
                </button>
              </>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-slate-800 mb-1">
                  등록된 채용공고가 없습니다.
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  새로운 공고를 등록하거나, 실시간 모빌리티 추천 탭에서 공고를 둘러보고 추가해보세요.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAddModal()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
                  >
                    새 공고 등록
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeActiveTab('recommendations')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>추천 공고 탐색</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
