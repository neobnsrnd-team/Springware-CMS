// src/lib/deploy-utils.ts
// 배포 공통 유틸 — 운영 서버 전송 헬퍼

/** 배포 대상 서버로 HTML + 트래커 JS 전송 */
export async function sendToServer(
    serverUrl: string,
    pageId: string,
    html: string,
    trackerJs?: string | null,
): Promise<void> {
    const res = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, html, trackerJs }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '응답 없음');
        throw new Error(`서버 전송 실패 (${res.status}): ${text}`);
    }
}
