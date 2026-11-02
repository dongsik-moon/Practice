import { DDayInfo } from '../types/job';

/**
 * Returns today's date formatted as YYYY-MM-DD using local time
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date at local midnight
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculates remaining days and D-day label from reference date (defaults to today)
 */
export function calculateDDay(endDate?: string, referenceDateStr?: string): DDayInfo {
  if (!endDate || endDate.trim() === '') {
    return {
      label: '마감일 미정',
      formattedDeadline: '마감일 미정',
      daysRemaining: null,
      isUrgent: false,
      isToday: false,
      isExpired: false,
    };
  }

  const todayStr = referenceDateStr || getTodayString();
  const today = parseDate(todayStr);
  const target = parseDate(endDate);

  // Calculate difference in whole days
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const targetMonth = target.getMonth() + 1;
  const targetDate = target.getDate();
  const monthDayStr = `${targetMonth}월 ${targetDate}일`;

  if (diffDays < 0) {
    return {
      label: '마감',
      formattedDeadline: `${monthDayStr} 마감 · 마감`,
      daysRemaining: diffDays,
      isUrgent: false,
      isToday: false,
      isExpired: true,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'D-DAY',
      formattedDeadline: `${monthDayStr} 마감 · D-DAY`,
      daysRemaining: 0,
      isUrgent: true,
      isToday: true,
      isExpired: false,
    };
  }

  const label = `D-${diffDays}`;
  return {
    label,
    formattedDeadline: `${monthDayStr} 마감 · ${label}`,
    daysRemaining: diffDays,
    isUrgent: diffDays <= 7,
    isToday: false,
    isExpired: false,
  };
}

/**
 * Format date string into Korean format: e.g. "2026년 11월 15일 (일)"
 */
export function formatKoreanDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = dayNames[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

/**
 * Format Month into Korean: e.g. "2026년 11월"
 */
export function formatKoreanYearMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export interface CalendarDayCell {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0=일, 1=월, ..., 6=토
}

/**
 * Generates calendar grid for given year and month (1-indexed month)
 * Week starts on Monday (월요일)
 */
export function generateMonthCalendar(year: number, month: number): CalendarDayCell[] {
  const todayStr = getTodayString();

  // First day of target month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  // Total days in target month
  const lastDayOfMonth = new Date(year, month, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Day of week for 1st day (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
  // For Monday start: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const jsDay = firstDayOfMonth.getDay();
  const mondayOffset = (jsDay + 6) % 7;

  const days: CalendarDayCell[] = [];

  // Previous month trailing days
  if (mondayOffset > 0) {
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    for (let i = mondayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const mStr = String(prevMonth).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateString = `${prevYear}-${mStr}-${dStr}`;
      const dObj = new Date(prevYear, prevMonth - 1, dayNum);

      days.push({
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        dayOfWeek: dObj.getDay(),
      });
    }
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const mStr = String(month).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateString = `${year}-${mStr}-${dStr}`;
    const dObj = new Date(year, month - 1, dayNum);

    days.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      dayOfWeek: dObj.getDay(),
    });
  }

  // Next month leading days to complete the 7-column rows
  const remainingCells = (7 - (days.length % 7)) % 7;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const mStr = String(nextMonth).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateString = `${nextYear}-${mStr}-${dStr}`;
    const dObj = new Date(nextYear, nextMonth - 1, dayNum);

    days.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      dayOfWeek: dObj.getDay(),
    });
  }

  return days;
}
