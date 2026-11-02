import React from 'react';
import { ExternalLink, Star, Edit3, Trash2, MapPin, Briefcase, GraduationCap, Clock } from 'lucide-react';
import { JobPosting, ApplicationStatus } from '../types/job';
import { calculateDDay } from '../utils/dateUtils';

interface JobNoticeCardProps {
  job: JobPosting;
  isSelected?: boolean;
  onSelect?: (job: JobPosting) => void;
  onHover?: (dateString?: string) => void;
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
  onToggleFavorite: (jobId: string) => void;
  onChangeStatus: (jobId: string, status: ApplicationStatus) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  '관심 공고',
  '지원 준비 중',
  '지원 완료',
  '서류 합격',
  '불합격',
  '최종 합격',
];

export const JobNoticeCard: React.FC<JobNoticeCardProps> = ({
  job,
  isSelected,
  onSelect,
  onHover,
  onEdit,
  onDelete,
  onToggleFavorite,
  onChangeStatus,
}) => {
  const ddayInfo = calculateDDay(job.endDate);

  // Status badge styling
  const getStatusBadgeStyle = (status: ApplicationStatus) => {
    switch (status) {
      case '서류 합격':
      case '최종 합격':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '지원 완료':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '지원 준비 중':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '불합격':
        return 'bg-slate-100 text-slate-500 border-slate-200 line-through';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // D-Day badge styling according to requirements:
  // - <= 7 days: emphasized amber/orange badge
  // - D-DAY: red/crimson badge
  // - expired: muted gray
  // - undetermined: neutral
  const getDDayBadgeStyle = () => {
    if (ddayInfo.daysRemaining === null) {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }
    if (ddayInfo.isExpired) {
      return 'bg-slate-100 text-slate-500 border-slate-200';
    }
    if (ddayInfo.isToday) {
      return 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse';
    }
    if (ddayInfo.isUrgent) {
      return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div
      onClick={() => onSelect?.(job)}
      onMouseEnter={() => onHover?.(job.endDate)}
      onMouseLeave={() => onHover?.(undefined)}
      className={`group relative bg-white rounded-xl p-5 border transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Row: Company Name + Education Badges on Left, Deadline & D-Day on Right */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Left: Company name (Bold Gothic, most prominent) + Education badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug break-keep">
              {job.company}
            </h3>

            {/* Fictional demo indicator badge if applicable */}
            {job.isDemo && (
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                가상 데모
              </span>
            )}

            {/* Enterprise Tier badge (대기업, 중견기업, 중소·강소기업) */}
            {job.tier && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  job.tier === '대기업'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : job.tier === '중견기업'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                {job.tier}
              </span>
            )}

            {/* Education condition badges (고졸, 초대졸, 대졸, 석사 or 학력 확인 필요) */}
            <div className="flex items-center flex-wrap gap-1">
              {job.education && job.education.length > 0 ? (
                job.education.map((edu) => (
                  <span
                    key={edu}
                    className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded"
                  >
                    {edu}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center text-xs font-normal text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  학력 확인 필요
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Deadline date + remaining D-day (e.g. '11월 15일 마감 · D-3') */}
        <div className="text-right shrink-0">
          <div
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border tabular-nums ${getDDayBadgeStyle()}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{ddayInfo.formattedDeadline}</span>
          </div>
        </div>
      </div>

      {/* Middle: Job title and Key Summary (3~4 lines) */}
      <div className="mb-4">
        <h4 className="text-base font-semibold text-slate-900 mb-2 leading-snug break-keep">
          {job.title}
        </h4>

        {/* Quick Meta: Location & Employment Type */}
        <div className="flex items-center flex-wrap gap-3 text-xs text-slate-600 mb-2.5">
          <span className="inline-flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            근무지: {job.location || '정보 확인 필요'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            채용 형태: {job.employmentType || '정보 확인 필요'}
          </span>
        </div>

        {/* Concise Summary / Qualifications */}
        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 border border-slate-100 rounded-lg p-2.5 whitespace-pre-line mb-2">
          {job.summary ? (
            <div>
              <span className="font-semibold text-slate-700">지원 자격 및 직무 요약: </span>
              {job.summary}
            </div>
          ) : (
            <span className="text-slate-400">지원 자격 정보 확인 필요</span>
          )}
        </div>

        {/* Mobility Keywords */}
        {job.keywords && job.keywords.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {job.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status & Management Controls strip */}
      <div className="flex items-center justify-between gap-2 pt-2 pb-3 border-t border-slate-100 text-xs">
        {/* Status Dropdown Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px]">지원 상태:</span>
          <select
            value={job.status}
            onChange={(e) => onChangeStatus(job.id, e.target.value as ApplicationStatus)}
            className={`text-xs font-medium border rounded px-2 py-1 bg-white cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusBadgeStyle(
              job.status
            )}`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Action icons: Favorite, Edit, Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(job.id);
            }}
            title={job.isFavorite ? '관심 공고 해제' : '관심 공고 등록'}
            className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
              job.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Star className={`w-4 h-4 ${job.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            title="공고 수정"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job.id);
            }}
            title="공고 삭제"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Bottom: Official Notice Action Button */}
      {job.url && job.url.trim() !== '' ? (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-sm"
        >
          <span>채용공고 확인하기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="w-full py-2.5 px-4 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200/60 rounded-lg cursor-not-allowed text-center"
        >
          공고 링크 등록 필요
        </button>
      )}
    </div>
  );
};
