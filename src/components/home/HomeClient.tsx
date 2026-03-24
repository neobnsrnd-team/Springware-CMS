// src/components/home/HomeClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { DEMO_USERS, DEFAULT_USER_ID, findDemoUser } from '@/data/demo-users';
import type { DemoUser } from '@/data/demo-users';

// cookie에서 cms-user 값 읽기
function getCookieUserId(): string {
    const match = document.cookie.match(/(?:^|;\s*)cms-user=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

// cookie에 cms-user 값 저장 (세션 유지, path=/ 전체 경로 적용)
function setCookieUserId(userId: string): void {
    document.cookie = `cms-user=${encodeURIComponent(userId)}; path=/; SameSite=Lax`;
}

export default function HomeClient() {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<DemoUser>(findDemoUser(DEFAULT_USER_ID));

    // 마운트 시 기존 cookie 값 복원
    useEffect(() => {
        const cookieUserId = getCookieUserId();
        if (cookieUserId) {
            const found = DEMO_USERS.find((u) => u.userId === cookieUserId);
            if (found) setSelectedUser(found);
        }
    }, []);

    function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const user = DEMO_USERS.find((u) => u.userId === e.target.value);
        if (user) {
            setSelectedUser(user);
            setCookieUserId(user.userId);
        }
    }

    function handleStart() {
        setCookieUserId(selectedUser.userId);
        if (selectedUser.role === 'admin') {
            router.push('/approve');
        } else {
            router.push(`/${selectedUser.userId}`);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-900 text-center">
            <main className="flex flex-col gap-6 max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Springware CMS</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    금융권 특화 비주얼 웹 콘텐츠 빌더입니다.
                    <br />
                    드래그 앤 드롭으로 금융 모바일 앱 화면을 쉽고 빠르게 만들어 보세요.
                </p>

                {/* 사용자 선택 드롭다운 */}
                <div className="flex flex-col items-center gap-2 mt-4">
                    <label htmlFor="user-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        사용자 선택
                    </label>
                    <select
                        id="user-select"
                        value={selectedUser.userId}
                        onChange={handleUserChange}
                        className="w-64 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-[#0046A4] focus:outline-none focus:ring-1 focus:ring-[#0046A4] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {DEMO_USERS.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.userName} ({user.role === 'admin' ? '관리자' : '작성자'})
                            </option>
                        ))}
                    </select>
                </div>

                {/* 시작 버튼 */}
                <div className="flex justify-center mt-2">
                    <button
                        onClick={handleStart}
                        className="inline-flex items-center justify-center rounded-xl bg-[#0046A4] text-white px-6 py-3 font-medium text-lg shadow-md hover:bg-[#003399] transition-colors"
                    >
                        {selectedUser.role === 'admin' ? '승인 관리' : '대시보드'}
                    </button>
                </div>
            </main>

            <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400">
                Powered by Springware &amp; ContentBuilder.js
            </footer>
        </div>
    );
}
