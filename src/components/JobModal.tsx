import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Building2, Briefcase, GraduationCap, MapPin, Calendar, Link as LinkIcon, Star } from 'lucide-react';
import { JobPosting, ApplicationStatus, EducationLevel } from '../types/job';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editingJob?: JobPosting | null;
  defaultEndDate?: string;
}

const EDUCATION_OPTIONS: EducationLevel[] = ['고졸', '초대졸', '대졸', '석사'];

const STATUS_OPTIONS: ApplicationStatus[] = [
  '관심 공고',
  '지원 준비 중',
  '지원 완료',
  '서류 합격',
  '불합격',
  '최종 합격',
];

const TIER_OPTIONS = ['대기업', '중견기업', '중소·강소기업'] as const;

const POPULAR_LOCATIONS = ['울산', '화성', '창원', '서산', '평택', '진천', '광주', '아산', '서울'];

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingJob,
  defaultEndDate,
}) => {
  const [company, setCompany] = useState('');
  const [tier, setTier] = useState<'대기업' | '중견기업' | '중소·강소기업'>('대기업');
  const [title, setTitle] = useState('');
  const [education, setEducation] = useState<EducationLevel[]>([]);
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('정규직');
  const [summary, setSummary] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isUndeterminedEndDate, setIsUndeterminedEndDate] = useState(false);
  const [url, setUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>('관심 공고');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingJob) {
      setCompany(editingJob.company || '');
      setTier(editingJob.tier || '대기업');
      setTitle(editingJob.title || '');
      setEducation(editingJob.education || []);
      setLocation(editingJob.location || '');
      setEmploymentType(editingJob.employmentType || '정규직');
      setSummary(editingJob.summary || '');
      setKeywordsInput((editingJob.keywords || []).join(', '));
      setStartDate(editingJob.startDate || '');
      setEndDate(editingJob.endDate || '');
      setIsUndeterminedEndDate(!editingJob.endDate || editingJob.endDate.trim() === '');
      setUrl(editingJob.url || '');
      setIsFavorite(editingJob.isFavorite || false);
      setStatus(editingJob.status || '관심 공고');
      setErrors({});
    } else {
      // New Posting
      setCompany('');
      setTier('대기업');
      setTitle('');
      setEducation(['대졸']);
      setLocation('울산');
      setEmploymentType('정규직');
      setSummary('');
      setKeywordsInput('#전동화, #생산기술');
      setStartDate('');
      if (defaultEndDate) {
        setEndDate(defaultEndDate);
        setIsUndeterminedEndDate(false);
      } else {
        setEndDate('');
        setIsUndeterminedEndDate(false);
      }
      setUrl('');
      setIsFavorite(false);
      setStatus('지원 준비 중');
      setErrors({});
    }
  }, [editingJob, defaultEndDate, isOpen]);

  if (!isOpen) return null;

  const toggleEducation = (level: EducationLevel) => {
    setEducation((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  };

  const handleLocationPreset = (loc: string) => {
    setLocation(loc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!company.trim()) {
      newErrors.company = '회사명을 입력해주세요.';
    }
    if (!title.trim()) {
      newErrors.title = '모집 직무를 입력해주세요.';
    }

    // Date range validation if both dates are provided
    if (!isUndeterminedEndDate && endDate && startDate && endDate < startDate) {
      newErrors.endDate = '마감일은 시작일 이후의 날짜여야 합니다.';
    }

    // URL validation if provided
    if (url.trim() && !url.startsWith('http://') && !url.startsWith('https://')) {
      newErrors.url = 'URL은 http:// 또는 https://로 시작해야 합니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const keywords = keywordsInput
      .split(/[,#]/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
      .map((k) => (k.startsWith('#') ? k : `#${k}`));

    onSave(
      {
        company: company.trim(),
        title: title.trim(),
        education,
        location: location.trim(),
        employmentType: employmentType.trim(),
        summary: summary.trim(),
        tier,
        keywords: keywords.length > 0 ? keywords : undefined,
        startDate: startDate.trim() || undefined,
        endDate: isUndeterminedEndDate ? undefined : endDate.trim() || undefined,
        url: url.trim() || undefined,
        isFavorite,
        status,
        isDemo: editingJob ? editingJob.isDemo : false,
      },
      editingJob?.id
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingJob ? '채용공고 수정' : '새 채용공고 등록'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              관심 기업의 채용 정보 및 마감 일정을 캘린더에 기록합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Row 1: Company & Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">
                  회사명 <span className="text-rose-500">*</span>
                </label>
                {/* Enterprise Tier selector */}
                <div className="flex items-center gap-1">
                  {TIER_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                        tier === t
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company) setErrors((prev) => ({ ...prev, company: '' }));
                  }}
                  placeholder="예: 현대자동차, 화신, 디와이오토"
                  className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                    errors.company ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.company && <p className="text-[11px] text-rose-500 mt-1">{errors.company}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                모집 직무 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholder="예: 생산기술 엔지니어, 품질관리"
                  className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                    errors.title ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Row 2: Education Badges Selection */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              학력 조건 <span className="text-slate-400 font-normal">(복수 선택 가능, 미선택 시 '학력 확인 필요' 표시)</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {EDUCATION_OPTIONS.map((level) => {
                const checked = education.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleEducation(level)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      checked
                        ? 'bg-blue-50 text-blue-700 border-blue-400 ring-1 ring-blue-400/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Location & Employment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                근무 지역
              </label>
              <div className="relative mb-1.5">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 울산, 화성, 전국"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>
              {/* Quick Preset Buttons for popular manufacturing regions */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400">빠른 선택:</span>
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationPreset(loc)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                채용 형태
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              >
                <option value="정규직">정규직</option>
                <option value="계약직">계약직</option>
                <option value="채용연계형 인턴">채용연계형 인턴</option>
                <option value="체험형 인턴">체험형 인턴</option>
                <option value="산학장학생">산학장학생</option>
              </select>
            </div>
          </div>

          {/* Row 4: Dates & Undetermined Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                지원 시작일
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">지원 마감일</label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={isUndeterminedEndDate}
                    onChange={(e) => setIsUndeterminedEndDate(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>마감일 미정</span>
                </label>
              </div>

              {!isUndeterminedEndDate ? (
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: '' }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                      errors.endDate
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
              ) : (
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-xs">
                  마감일 미정으로 등록됩니다. (캘린더 별도 탭에서 조회 가능)
                </div>
              )}
              {errors.endDate && <p className="text-[11px] text-rose-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Row 5: Summary & Key Qualifications (3~4 lines max) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              공고 요약 및 핵심 지원 자격 <span className="text-slate-400 font-normal">(3~4줄 권장)</span>
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예: 
생산공정 신설비 셋업 및 공정 개선
PLC 및 자동화 제어 가능자 우대
기계/전기전자 전공 및 기사 자격증 소지자"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 leading-relaxed resize-none"
            />
          </div>

          {/* Row 5-2: Mobility Keywords */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              모빌리티 & 직무 키워드 <span className="text-slate-400 font-normal">(쉼표 또는 # 구분)</span>
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="예: #전동화, #배터리, #PLC보전, #스마트팩토리"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Row 6: Official Notice URL */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              공식 채용공고 URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errors.url) setErrors((prev) => ({ ...prev, url: '' }));
                }}
                placeholder="https://talent.hyundai.com (미입력 시 '공고 링크 등록 필요' 표시)"
                className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 ${
                  errors.url ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.url && <p className="text-[11px] text-rose-500 mt-1">{errors.url}</p>}
          </div>

          {/* Row 7: Status & Favorite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                지원 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                  관심 기업 공고로 등록
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              {editingJob ? '변경사항 저장' : '공고 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
