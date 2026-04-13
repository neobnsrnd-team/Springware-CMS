// src/components/dashboard/ApprovalRequestModal.tsx
'use client';

import { useState } from 'react';

import { DEMO_USERS } from '@/data/demo-users';
import Modal from '@/components/ui/Modal';

import type { DashboardPageCard } from './DashboardClient';

// 결재자 목록 — admin 역할만 노출
const APPROVER_LIST = DEMO_USERS.filter((u) => u.role === 'admin');

// 뷰 모드 한국어 라벨
const VIEW_MODE_LABEL: Record<string, string> = {
    mobile: '모바일',
    web: '웹',
    responsive: '반응형',
};

// 뷰 모드 아이콘
const VIEW_MODE_ICON: Record<string, string> = {
    mobile: '📱',
    web: '🖥️',
    responsive: '🔄',
};

interface ApprovalRequestModalProps {
    page: DashboardPageCard;
    onClose: () => void;
    onSubmit: (approverId: string, approverName: string, expiredDate: string) => Promise<void>;
}

export default function ApprovalRequestModal({ page, onClose, onSubmit }: ApprovalRequestModalProps) {
    const [approverId, setApproverId] = useState('');
    const [expiredDate, setExpiredDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const selectedApprover = APPROVER_LIST.find((u) => u.userId === approverId);

    // 오늘 이후 날짜만 선택 가능 — 로컬 타임 기준 내일 날짜 계산
    const minDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');

    async function handleSubmit() {
        if (!selectedApprover || !expiredDate || submitting) return;
        setSubmitting(true);
        try {
            await onSubmit(selectedApprover.userId, selectedApprover.userName, expiredDate);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal title="승인 요청" onClose={onClose} width="440px">
            {/* 썸네일 + 페이지 정보 */}
            <div className="px-7 pb-5">
                <div
                    className="w-full h-[140px] rounded-xl border border-[#f3f4f6] flex items-center justify-center mb-4 shrink-0"
                    style={{
                        background: page.thumbnail ? `url(${page.thumbnail}) center/cover no-repeat` : '#f0f4ff',
                    }}
                >
                    {!page.thumbnail && (
                        <span className="text-[40px] opacity-40">{VIEW_MODE_ICON[page.viewMode] ?? '🔄'}</span>
                    )}
                </div>

                <p className="m-0 text-sm font-semibold text-[#111827] truncate mb-1" title={page.label}>
                    {page.label}
                </p>
                <p className="m-0 text-xs text-[#9ca3af]">{VIEW_MODE_LABEL[page.viewMode] ?? page.viewMode}</p>
            </div>

            {/* 결재자 선택 */}
            <div className="px-7 pb-6">
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    결재자 선택 <span className="text-[#dc2626]">*</span>
                </label>
                <select
                    value={approverId}
                    onChange={(e) => setApproverId(e.target.value)}
                    className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#d1d5db] text-sm outline-none bg-white text-[#111827]"
                >
                    <option value="">선택해주세요</option>
                    {APPROVER_LIST.map((u) => (
                        <option key={u.userId} value={u.userId}>
                            {u.userName}
                        </option>
                    ))}
                </select>
            </div>

            {/* 만료일 선택 */}
            <div className="px-7 pb-6">
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                    만료일 <span className="text-[#dc2626]">*</span>
                </label>
                <input
                    type="date"
                    value={expiredDate}
                    min={minDate}
                    onChange={(e) => setExpiredDate(e.target.value)}
                    className="w-full box-border px-[14px] py-2.5 rounded-lg border border-[#d1d5db] text-sm outline-none bg-white text-[#111827]"
                />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 px-7 pb-6">
                <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] text-sm cursor-pointer"
                >
                    취소
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!approverId || !expiredDate || submitting}
                    className={`px-5 py-2.5 rounded-lg border-0 text-white text-sm font-semibold ${
                        !approverId || !expiredDate || submitting
                            ? 'bg-[#d1d5db] cursor-not-allowed'
                            : 'bg-[#0046A4] cursor-pointer'
                    }`}
                >
                    {submitting ? '요청 중...' : '승인 요청'}
                </button>
            </div>
        </Modal>
    );
}
