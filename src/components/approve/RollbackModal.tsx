// src/components/approve/RollbackModal.tsx
// 버전 롤백 모달 — 승인 이력 목록에서 원하는 버전 선택 후 롤백 실행
'use client';

import { useState, useEffect } from 'react';

import Modal from '@/components/ui/Modal';

interface HistoryItem {
    PAGE_ID: string;
    VERSION: number;
    PAGE_NAME: string;
    APPROVE_STATE: string;
    LAST_MODIFIER_ID: string | null;
    LAST_MODIFIER_NAME: string | null;
    APPROVE_DATE: string | null;
}

interface RollbackModalProps {
    pageId: string;
    pageLabel: string;
    onClose: () => void;
    onSuccess: () => void;
}

/** APPROVE_DATE ISO 문자열 → 날짜 포맷 */
function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
}

export default function RollbackModal({ pageId, pageLabel, onClose, onSuccess }: RollbackModalProps) {
    const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [rolling, setRolling] = useState(false);

    // 승인 이력 조회
    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch(`/api/builder/pages/${encodeURIComponent(pageId)}/history`);
                const data = await res.json();
                if (data.ok) setHistoryList(data.history ?? []);
            } catch (err: unknown) {
                console.error('승인 이력 조회 오류:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [pageId]);

    // 롤백 실행
    async function handleConfirm() {
        if (selectedVersion === null || rolling) return;
        if (!window.confirm(`v${selectedVersion}으로 롤백하시겠습니까?\n롤백 후 재승인 절차가 필요합니다.`)) return;

        setRolling(true);
        try {
            const res = await fetch(`/api/builder/pages/${encodeURIComponent(pageId)}/rollback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: selectedVersion }),
            });
            const data = await res.json();
            if (!data.ok) {
                alert(data.error ?? '롤백에 실패했습니다.');
                return;
            }
            alert(data.message ?? `v${selectedVersion}으로 롤백이 완료되었습니다.`);
            onSuccess();
        } catch (err: unknown) {
            console.error('롤백 오류:', err);
            alert('롤백 처리에 실패했습니다.');
        } finally {
            setRolling(false);
        }
    }

    return (
        <Modal title="버전 롤백" onClose={onClose} width="520px">
            <div className="px-7 pb-7">
                {/* 페이지 정보 */}
                <p className="m-0 mb-4 text-sm text-[#6b7280]">
                    <span className="font-semibold text-[#111827]">{pageLabel}</span>의 버전을 선택하세요. 롤백 후
                    재승인 절차가 필요합니다.
                </p>

                {/* 이력 목록 */}
                <div className="border border-[#e5e7eb] rounded-xl overflow-hidden mb-5">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-[#9ca3af]">불러오는 중...</div>
                    ) : historyList.length === 0 ? (
                        <div className="py-8 text-center text-sm text-[#9ca3af]">승인 이력이 없습니다.</div>
                    ) : (
                        <ul className="m-0 p-0 list-none divide-y divide-[#f3f4f6]">
                            {historyList.map((item) => (
                                <li
                                    key={item.VERSION}
                                    onClick={() => setSelectedVersion(item.VERSION)}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-100 ${
                                        selectedVersion === item.VERSION
                                            ? 'bg-[#eff6ff]'
                                            : 'bg-white hover:bg-[#f9fafb]'
                                    }`}
                                >
                                    {/* 라디오 */}
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                            selectedVersion === item.VERSION ? 'border-[#0046A4]' : 'border-[#d1d5db]'
                                        }`}
                                    >
                                        {selectedVersion === item.VERSION && (
                                            <div className="w-2 h-2 rounded-full bg-[#0046A4]" />
                                        )}
                                    </div>

                                    {/* 버전 배지 */}
                                    <span
                                        className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                            selectedVersion === item.VERSION
                                                ? 'bg-[#0046A4] text-white'
                                                : 'bg-[#f3f4f6] text-[#6b7280]'
                                        }`}
                                    >
                                        v{item.VERSION}
                                    </span>

                                    {/* 정보 */}
                                    <div className="min-w-0 flex-1">
                                        <p className="m-0 text-sm font-medium text-[#111827] truncate">
                                            {item.PAGE_NAME}
                                        </p>
                                        <p className="m-0 text-[11px] text-[#9ca3af]">
                                            {item.LAST_MODIFIER_NAME ?? item.LAST_MODIFIER_ID ?? '-'} ·{' '}
                                            {formatDate(item.APPROVE_DATE)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] text-sm cursor-pointer"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedVersion === null || rolling}
                        className={`px-5 py-2.5 rounded-lg border-0 text-white text-sm font-semibold ${
                            selectedVersion === null || rolling
                                ? 'bg-[#d1d5db] cursor-not-allowed'
                                : 'bg-[#1e3a5f] cursor-pointer'
                        }`}
                    >
                        {rolling ? '롤백 중...' : '롤백 확정'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
