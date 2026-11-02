import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, Sparkles } from 'lucide-react';
import { JobPosting } from '../types/job';
import { generateMonthCalendar, formatKoreanYearMonth, calculateDDay, getTodayString } from '../utils/dateUtils';

interface CalendarViewProps {
  currentYear: number;
  currentMonth: number;
  selectedDate?: string;
  highlightedDate?: string;
  postings: JobPosting[];
  onSelectDate: (dateString?: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onSelectUndetermined: () => void;
  isUndeterminedActive?: boolean;
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentYear,
  currentMonth,
  selectedDate,
  highlightedDate,
  postings,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onSelectUndetermined,
  isUndeterminedActive,
}) => {
  const days = generateMonthCalendar(currentYear, currentMonth);
  const todayStr = getTodayString();

  // Group postings by deadline date string
  const postingsByDate = React.useMemo(() => {
    const map = new Map<string, JobPosting[]>();
    postings.forEach((job) => {
      if (job.endDate && job.endDate.trim() !== '') {
        const list = map.get(job.endDate) || [];
        list.push(job);
        map.set(job.endDate, list);
      }
    });
    return map;
  }, [postings]);

  // Undetermined deadline notices
  const undeterminedCount = React.useMemo(() => {
    return postings.filter((p) => !p.endDate || p.endDate.trim() === '').length;
  }, [postings]);

  // Current month summary stats
  const currentMonthStats = React.useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const thisMonthPostings = postings.filter(
      (p) => p.endDate && p.endDate.startsWith(monthPrefix)
    );
    const urgentCount = thisMonthPostings.filter((p) => {
      const dday = calculateDDay(p.endDate);
      return dday.isUrgent && !dday.isExpired;
    }).length;

    return {
      total: thisMonthPostings.length,
      urgent: urgentCount,
    };
  }, [postings, currentYear, currentMonth]);

  const handleCellClick = (dateString: string) => {
    if (selectedDate === dateString) {
      // Toggle off -> show full month
      onSelectDate(undefined);
    } else {
      onSelectDate(dateString);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Top Header of Calendar */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">채용 캘린더</h2>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium border border-slate-200">
                월간 보기
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              날짜를 선택하면 해당 마감일의 채용공고를 확인합니다.
            </p>
          </div>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-2">
          {/* Year and Month */}
          <span className="text-base font-bold text-slate-900 px-2 tabular-nums">
            {formatKoreanYearMonth(currentYear, currentMonth)}
          </span>

          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={onPrevMonth}
              title="이전 달"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              title="다음 달"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onGoToToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            오늘
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="p-4 flex-1 flex flex-col min-h-[460px]">
        {/* 7 Columns Day Names (월 ~ 일) */}
        <div className="grid grid-cols-7 mb-2 border-b border-slate-100 pb-2 text-center">
          {WEEKDAYS.map((name, idx) => {
            const isWeekend = idx === 5 || idx === 6;
            const isSunday = idx === 6;
            return (
              <div
                key={name}
                className={`text-xs font-semibold tracking-wider ${
                  isSunday ? 'text-rose-500' : isWeekend ? 'text-blue-500' : 'text-slate-500'
                }`}
              >
                {name}
              </div>
            );
          })}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
          {days.map((cell) => {
            const dayPostings = postingsByDate.get(cell.dateString) || [];
            const hasDeadlines = dayPostings.length > 0;
            const isSelected = selectedDate === cell.dateString;
            const isHighlighted = highlightedDate === cell.dateString;

            // Check if any notice on this date is urgent (<= 7 days) or D-DAY
            const hasUrgent = dayPostings.some((p) => {
              const dday = calculateDDay(p.endDate);
              return dday.isUrgent && !dday.isExpired;
            });
            const hasTodayDeadline = dayPostings.some((p) => {
              const dday = calculateDDay(p.endDate);
              return dday.isToday;
            });

            // Sunday is 0, Saturday is 6 in JS Date
            const isSunday = cell.dayOfWeek === 0;
            const isSaturday = cell.dayOfWeek === 6;

            return (
              <div
                key={cell.dateString}
                onClick={() => handleCellClick(cell.dateString)}
                className={`relative min-h-[82px] p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20'
                    : isHighlighted
                    ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300'
                    : cell.isCurrentMonth
                    ? 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    : 'border-transparent bg-slate-50/40 text-slate-400 hover:bg-slate-100/50'
                }`}
              >
                {/* Cell Header: Day number + Today indicator */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-semibold w-6 h-6 rounded-full tabular-nums ${
                      cell.isToday
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : isSelected
                        ? 'text-blue-700 font-bold'
                        : !cell.isCurrentMonth
                        ? 'text-slate-300'
                        : isSunday
                        ? 'text-rose-600'
                        : isSaturday
                        ? 'text-blue-600'
                        : 'text-slate-700'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Deadline count pill if any exist */}
                  {hasDeadlines && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums border ${
                        hasTodayDeadline
                          ? 'bg-rose-100 text-rose-700 border-rose-300'
                          : hasUrgent
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={`${dayPostings.length}개 공고 마감`}
                    >
                      {dayPostings.length}건
                    </span>
                  )}
                </div>

                {/* Deadlines previews inside the cell */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {hasDeadlines && (
                    <>
                      {dayPostings.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate font-medium border ${
                            hasTodayDeadline
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : hasUrgent
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title={`${job.company}: ${job.title}`}
                        >
                          <span className="font-bold">{job.company}</span>
                        </div>
                      ))}
                      {dayPostings.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-semibold text-center">
                          +{dayPostings.length - 2}개 더보기
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>오늘 ({todayStr})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>마감 임박 (D-7 이내)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>당일 마감 (D-DAY)</span>
          </div>
        </div>

        {/* Undetermined deadline quick link */}
        {undeterminedCount > 0 && (
          <button
            type="button"
            onClick={onSelectUndetermined}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
              isUndeterminedActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>마감일 미정 공고 ({undeterminedCount}건)</span>
          </button>
        )}
      </div>
    </div>
  );
};
