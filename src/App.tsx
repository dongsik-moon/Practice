/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { JobList } from './components/JobList';
import { JobModal } from './components/JobModal';
import { ConfirmModal } from './components/ConfirmModal';
import { JobPosting, ApplicationStatus, RecommendedJob } from './types/job';
import { storageService } from './services/storage';
import { formatKoreanYearMonth } from './utils/dateUtils';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [postings, setPostings] = useState<JobPosting[]>(() => {
    return storageService.loadPostings();
  });

  // Calendar view navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);

  // Selected date filter (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  // Undetermined deadline filter active
  const [isUndeterminedActive, setIsUndeterminedActive] = useState<boolean>(false);

  // Date highlighted by hovering on a job card
  const [highlightedDate, setHighlightedDate] = useState<string | undefined>(undefined);

  // Active right-side tab: 'my-jobs' | 'recommendations'
  const [activeTab, setActiveTab] = useState<'my-jobs' | 'recommendations'>('my-jobs');

  // Real-time Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState<boolean>(false);

  // Toast notification for actions like adding recommended job to calendar
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  // Delete confirmation modal state
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Save to localStorage whenever postings change
  useEffect(() => {
    storageService.savePostings(postings);
  }, [postings]);

  // Toast auto-dismiss timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch real-time mobility recommendations based on applied postings
  const fetchRecommendations = useCallback(
    async (tierFilter?: string, keywordFilter?: string) => {
      setIsRecommendationsLoading(true);
      try {
        // Collect user's applied or interest postings for AI prompt
        const applied = postings.filter(
          (p) =>
            p.status === '지원 완료' ||
            p.status === '지원 준비 중' ||
            p.status === '서류 합격' ||
            p.status === '최종 합격' ||
            p.isFavorite
        );

        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appliedPostings: applied.length > 0 ? applied : postings,
            tierFilter: tierFilter || '전체',
            keywordFilter: keywordFilter || '',
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error('Failed to load real-time recommendations:', error);
      } finally {
        setIsRecommendationsLoading(false);
      }
    },
    [postings]
  );

  // Load recommendations on initial mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Calendar month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(undefined);
    setIsUndeterminedActive(false);
  };

  // Date cell click in calendar
  const handleSelectDate = (dateStr?: string) => {
    setSelectedDate(dateStr);
    setIsUndeterminedActive(false);
    // Switch to my-jobs tab to view the date's postings
    setActiveTab('my-jobs');
  };

  // Clear date filter to see all postings
  const handleClearDateFilter = () => {
    setSelectedDate(undefined);
    setIsUndeterminedActive(false);
  };

  // Toggle undetermined filter
  const handleSelectUndetermined = () => {
    setIsUndeterminedActive((prev) => !prev);
    setSelectedDate(undefined);
    setActiveTab('my-jobs');
  };

  // Add / Edit Modal handlers
  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingJob(null);
    setModalDefaultDate(defaultDate);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: JobPosting) => {
    setEditingJob(job);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    setModalDefaultDate(undefined);
  };

  const handleSaveJob = (
    jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const nowIso = new Date().toISOString();

    if (editId) {
      // Update existing
      setPostings((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                ...jobData,
                updatedAt: nowIso,
              }
            : item
        )
      );
      setToastMessage(`'${jobData.company}' 공고가 수정되었습니다.`);
    } else {
      // Create new
      const newJob: JobPosting = {
        ...jobData,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setPostings((prev) => [newJob, ...prev]);

      // If notice has endDate, switch calendar month to match so user immediately sees it
      if (newJob.endDate) {
        const [y, m] = newJob.endDate.split('-').map(Number);
        setCurrentYear(y);
        setCurrentMonth(m);
        setSelectedDate(newJob.endDate);
      }
      setActiveTab('my-jobs');
      setToastMessage(`'${jobData.company}' 공고가 캘린더에 등록되었습니다.`);
    }
  };

  // Add Recommended Job directly into Calendar
  const handleAddRecommendedToCalendar = (rec: RecommendedJob) => {
    const nowIso = new Date().toISOString();
    const newPosting: JobPosting = {
      id: `rec-added-${Date.now()}`,
      company: rec.company,
      tier: rec.tier,
      title: rec.title,
      education: rec.education,
      location: rec.location,
      employmentType: rec.employmentType,
      summary: rec.summary,
      keywords: rec.keywords,
      startDate: rec.startDate,
      endDate: rec.endDate,
      url: rec.url,
      isFavorite: true,
      status: '관심 공고',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setPostings((prev) => [newPosting, ...prev]);

    // Move calendar if notice has deadline
    if (newPosting.endDate) {
      const [y, m] = newPosting.endDate.split('-').map(Number);
      setCurrentYear(y);
      setCurrentMonth(m);
      setSelectedDate(newPosting.endDate);
      setHighlightedDate(newPosting.endDate);
    }

    // Switch tab to my-jobs so user immediately sees it
    setActiveTab('my-jobs');
    setToastMessage(`[${rec.tier}] '${rec.company}' 공고가 캘린더에 추가되었습니다!`);
  };

  // Delete handlers
  const handlePromptDelete = (jobId: string) => {
    setDeletingJobId(jobId);
  };

  const handleConfirmDelete = () => {
    if (!deletingJobId) return;
    const target = postings.find((p) => p.id === deletingJobId);
    setPostings((prev) => prev.filter((item) => item.id !== deletingJobId));
    setDeletingJobId(null);
    if (target) {
      setToastMessage(`'${target.company}' 공고가 삭제되었습니다.`);
    }
  };

  const handleCancelDelete = () => {
    setDeletingJobId(null);
  };

  // Favorite toggle
  const handleToggleFavorite = (jobId: string) => {
    setPostings((prev) =>
      prev.map((item) =>
        item.id === jobId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Change Application Status
  const handleChangeStatus = (jobId: string, status: ApplicationStatus) => {
    setPostings((prev) =>
      prev.map((item) => (item.id === jobId ? { ...item, status } : item))
    );
  };

  // Reset to initial demo data
  const handleResetToDemo = () => {
    const demos = storageService.resetToDemo();
    setPostings(demos);
    setSelectedDate(undefined);
    setIsUndeterminedActive(false);
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setToastMessage('초기 데모 가상 공고 데이터로 복원되었습니다.');
    // Also refresh recommendations
    fetchRecommendations();
  };

  // Job selection highlight on calendar
  const handleSelectJob = (job: JobPosting) => {
    if (job.endDate) {
      setHighlightedDate(job.endDate);
      const [y, m] = job.endDate.split('-').map(Number);
      if (y !== currentYear || m !== currentMonth) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    }
  };

  const deletingJob = postings.find((p) => p.id === deletingJobId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs font-semibold animate-fade-in border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        postings={postings}
        onOpenAddModal={() => handleOpenAddModal(selectedDate)}
        onResetToDemo={handleResetToDemo}
      />

      {/* Main Split View: Left 55% Calendar, Right 45% Job Notices */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Area: Recruitment Calendar (~55% width: 7 of 12 columns = 58.3%) */}
          <div className="lg:col-span-7 h-full">
            <CalendarView
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              highlightedDate={highlightedDate}
              postings={postings}
              onSelectDate={handleSelectDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onGoToToday={handleGoToToday}
              onSelectUndetermined={handleSelectUndetermined}
              isUndeterminedActive={isUndeterminedActive}
            />
          </div>

          {/* Right Area: Job Notices Summary List (~45% width: 5 of 12 columns = 41.7%) */}
          <div className="lg:col-span-5 h-full">
            <JobList
              postings={postings}
              selectedDate={selectedDate}
              selectedMonthLabel={formatKoreanYearMonth(currentYear, currentMonth)}
              isUndeterminedActive={isUndeterminedActive}
              onClearDateFilter={handleClearDateFilter}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteJob={handlePromptDelete}
              onToggleFavorite={handleToggleFavorite}
              onChangeStatus={handleChangeStatus}
              onHoverJobDate={(dateStr) => setHighlightedDate(dateStr)}
              onSelectJob={handleSelectJob}
              onResetToDemo={handleResetToDemo}
              recommendations={recommendations}
              isRecommendationsLoading={isRecommendationsLoading}
              onRefreshRecommendations={fetchRecommendations}
              onAddRecommendedToCalendar={handleAddRecommendedToCalendar}
              activeTab={activeTab}
              onChangeActiveTab={setActiveTab}
            />
          </div>
        </div>
      </main>

      {/* Add / Edit Job Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJob}
        editingJob={editingJob}
        defaultEndDate={modalDefaultDate}
      />

      {/* Safe Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingJobId !== null}
        title="채용공고 삭제"
        message={
          deletingJob
            ? `'${deletingJob.company} - ${deletingJob.title}' 공고를 정말 삭제하시겠습니까? 삭제된 공고는 복구할 수 없습니다.`
            : '해당 공고를 삭제하시겠습니까?'
        }
        confirmLabel="삭제하기"
        cancelLabel="취소"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
