import React from 'react';
import { Calendar, Plus, RefreshCw, Briefcase, Sparkles } from 'lucide-react';
import { JobPosting } from '../types/job';
import { calculateDDay } from '../utils/dateUtils';

interface HeaderProps {
  postings: JobPosting[];
  onOpenAddModal: () => void;
  onResetToDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  postings,
  onOpenAddModal,
  onResetToDemo,
}) => {
  const urgentCount = React.useMemo(() => {
    return postings.filter((p) => {
      const dday = calculateDDay(p.endDate);
      return dday.isUrgent && !dday.isExpired;
    }).length;
  }, [postings]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Career Calendar
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
                제조·자동차 특화
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              채용공고 및 지원 마감일 통합 관리 대시보드
            </p>
          </div>
        </div>

        {/* Center: Live Overview Counters (tabular nums) */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>등록 공고:</span>
            <span className="font-bold tabular-nums text-slate-900">{postings.length}건</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>마감 임박(D-7):</span>
            <span className="font-bold tabular-nums text-amber-900">{urgentCount}건</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onResetToDemo}
            title="초기 데모 가상 공고 데이터로 복원"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">데모 데이터 복원</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>공고 추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
