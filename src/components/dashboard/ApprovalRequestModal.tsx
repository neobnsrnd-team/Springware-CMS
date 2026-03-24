// src/components/dashboard/ApprovalRequestModal.tsx
'use client';

import { useState } from 'react';

import { DEMO_USERS } from '@/data/demo-users';

import type { PageCard } from './DashboardClient';

// 결재자 목록 — admin 역할만 노출
const APPROVER_LIST = DEMO_USERS.filter((u) => u.role === 'admin');

// 뷰 모드 한국어 라벨
const VIEW_MODE_LABEL: Record<string, string> = {
    mobile: '모바일',
    web: '웹',
    responsive: '반응형',
};

interface ApprovalRequestModalProps {
    page: PageCard;
    onClose: () => void;
    onSubmit: (approverId: string, approverName: string) => Promise<void>;
}

export default function ApprovalRequestModal({ page, onClose, onSubmit }: ApprovalRequestModalProps) {
    const [approverId, setApproverId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const selectedApprover = APPROVER_LIST.find((u) => u.userId === approverId);

    async function handleSubmit() {
        if (!selectedApprover || submitting) return;
        setSubmitting(true);
        try {
            await onSubmit(selectedApprover.userId, selectedApprover.userName);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[20px] w-[440px] max-w-[90vw] shadow-[0_24px_64px_rgba(0,70,164,0.15)] overflow-hidden"
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-7 pt-6 pb-4">
                    <h3 className="m-0 text-[17px] font-bold text-[#111827]">승인 요청</h3>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full border-0 bg-transparent text-[#9ca3af] text-lg cursor-pointer hover:bg-[#f3f4f6]"
                    >
                        ✕
                    </button>
                </div>

                {/* 썸네일 + 페이지 정보 */}
                <div className="px-7 pb-5">
                    <div
                        className="w-full h-[140px] rounded-xl border border-[#f3f4f6] flex items-center justify-center mb-4 shrink-0"
                        style={{
                            background: page.thumbnail ? `url(${page.thumbnail}) center/cover no-repeat` : '#f0f4ff',
                        }}
                    >
                        {!page.thumbnail && (
                            <span className="text-[40px] opacity-40">
                                {page.viewMode === 'mobile' ? '📱' : page.viewMode === 'web' ? '🖥️' : '🔄'}
                            </span>
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
                        disabled={!approverId || submitting}
                        className={`px-5 py-2.5 rounded-lg border-0 text-white text-sm font-semibold ${
                            !approverId || submitting
                                ? 'bg-[#d1d5db] cursor-not-allowed'
                                : 'bg-[#0046A4] cursor-pointer'
                        }`}
                    >
                        {submitting ? '요청 중...' : '승인 요청'}
                    </button>
                </div>
            </div>
        </div>
    );
}
