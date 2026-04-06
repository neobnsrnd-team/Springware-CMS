// public/assets/plugins/popup-banner/index.js

const STORAGE_PREFIX = 'popup-banner-hide-';

/** localStorage 키: popup-banner-hide-{pageId} */
function getStorageKey(pageId) {
    return STORAGE_PREFIX + (pageId || 'default');
}

/** pageId 추출 — URL 쿼리 파라미터 ?pageId=xxx */
function getPageId() {
    try {
        return new URLSearchParams(window.location.search).get('pageId') || 'default';
    } catch {
        return 'default';
    }
}

/** N일간 보지 않기 유효 여부 확인 */
function isHiddenUntil(pageId) {
    try {
        const raw = localStorage.getItem(getStorageKey(pageId));
        if (!raw) return false;
        return Date.now() < parseInt(raw, 10);
    } catch {
        return false;
    }
}

/** N일간 보지 않기 저장 */
function saveHideUntil(pageId, days) {
    try {
        const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
        localStorage.setItem(getStorageKey(pageId), String(expiry));
    } catch {
        // localStorage 접근 불가 시 무시
    }
}

/** data-images JSON 파싱 */
function parseImages(element) {
    try {
        const raw = element.getAttribute('data-images');
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

/** 슬라이드 인디케이터 동기화 */
function syncIndicators(dots, index) {
    dots.forEach((dot, i) => {
        dot.classList.toggle('pb-dot--active', i === index);
    });
}

export default {
    name: 'popup-banner',
    displayName: '이미지 팝업 배너',
    version: '1.0.0',

    editor: {
        openContentEditor(element, builder, onChange) {
            // 편집은 EditClient.tsx의 #divLinkTool 버튼 주입 방식으로 처리
            // ContentBuilder가 appendChild 할 수 있도록 안내 UI 반환
            const container = document.createElement('div');
            container.style.cssText = 'padding:20px 16px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,\'Malgun Gothic\',sans-serif;';
            container.innerHTML = `
                <div style="font-size:32px;margin-bottom:12px;">🖼️</div>
                <div style="font-size:14px;font-weight:700;color:#1A1A2E;margin-bottom:6px;">이미지 팝업 배너</div>
                <div style="font-size:12px;color:#6B7280;line-height:1.6;">
                    블록 내 링크 영역을 클릭하면<br>
                    나타나는 편집 버튼(⊞)을 이용하세요.
                </div>`;
            return container;
        },
    },

    mount(element, options) {
        // window.__spwEditor: EditClient.tsx 런타임 초기화 시 true로 설정
        const isEditor = !!window.__spwEditor;
        const images = parseImages(element);
        const hideDays = parseInt(element.getAttribute('data-hide-days') || '3', 10);
        const pageId = getPageId();

        // ── 재마운트 시 기존 시트 제거 (저장된 HTML에 시트가 포함된 경우 누적 방지) ──
        const existingSheet = element.querySelector('.pb-sheet--editor');
        if (existingSheet) existingSheet.remove();

        // 뷰어 모드: 동일 페이지 첫 번째 팝업만 활성화
        if (!isEditor) {
            const allBanners = document.querySelectorAll('[data-cb-type="popup-banner"]');
            if (allBanners[0] !== element) return {};
            // "N일간 보지 않기" 기간 내이면 미표시
            if (isHiddenUntil(pageId)) return {};
        }

        // 이미지가 없으면 에디터에서도 안내 UI 표시 후 종료
        if (images.length === 0) {
            if (isEditor) {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'pb-sheet--editor';
                emptyEl.style.cssText = [
                    'position:relative',
                    "border-radius:20px 20px 0 0",
                    'box-shadow:0 -4px 24px rgba(0,0,0,0.08)',
                    'background:#fff',
                    "font-family:-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif",
                    'overflow:hidden',
                    'padding:24px 20px',
                    'text-align:center',
                    'color:#6B7280',
                    'font-size:13px',
                ].join(';');
                emptyEl.innerHTML = `
                    <div style="margin-bottom:8px;font-size:20px;">🖼️</div>
                    <div style="font-weight:600;color:#1A1A2E;margin-bottom:4px;">이미지 팝업 배너</div>
                    <div>편집 버튼을 클릭해 이미지를 추가하세요.</div>
                    <a href="#" style="display:none;"></a>`;
                element.appendChild(emptyEl);
                return { sheetEl: emptyEl, handlers: [] };
            }
            return {};
        }

        let currentIndex = 0;
        let overlay = null;
        const handlers = [];

        // ── DOM 생성 ──
        const sheetEl = document.createElement('div');

        if (isEditor) {
            // 에디터: inline 고정 표시
            sheetEl.className = 'pb-sheet--editor';
            sheetEl.style.cssText = [
                'position:relative',
                'border-radius:20px 20px 0 0',
                'box-shadow:0 -4px 24px rgba(0,0,0,0.08)',
                'background:#fff',
                "font-family:-apple-system,BlinkMacSystemFont,'Malgun Gothic','Apple SD Gothic Neo',sans-serif",
                'overflow:hidden',
            ].join(';');
        } else {
            // 뷰어: position fixed Bottom Sheet
            overlay = document.createElement('div');
            overlay.className = 'pb-overlay';
            document.body.appendChild(overlay);
            sheetEl.className = 'pb-sheet';
        }

        // ── 에디터 전용: 상단 식별 배너 ──
        if (isEditor) {
            const editorBadge = document.createElement('div');
            editorBadge.style.cssText = [
                'display:flex',
                'align-items:center',
                'gap:6px',
                'padding:6px 14px',
                'background:#E8F0FC',
                'border-bottom:1px solid #C7D8F4',
            ].join(';');
            editorBadge.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0046A4" stroke-width="2" stroke-linecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18"/>
                </svg>
                <span style="font-size:11px;font-weight:700;color:#0046A4;letter-spacing:0.02em;">이미지 팝업 배너 — 편집 버튼으로 이미지 수정</span>`;
            sheetEl.appendChild(editorBadge);
        }

        // ── 헤더 (인디케이터 + 미리보기 라벨 or 닫기 버튼) ──
        const header = document.createElement('div');
        header.className = 'pb-header';

        const indicatorWrap = document.createElement('div');
        indicatorWrap.className = 'pb-indicators';
        const dots = images.map(() => {
            const dot = document.createElement('span');
            dot.className = 'pb-dot';
            indicatorWrap.appendChild(dot);
            return dot;
        });

        const closeBtn = document.createElement('button');
        closeBtn.className = 'pb-close-btn';
        closeBtn.setAttribute('aria-label', isEditor ? '미리보기' : '닫기');

        if (isEditor) {
            closeBtn.innerHTML = `<span style="font-size:11px;font-weight:600;color:#6B7280;white-space:nowrap;">${images.length}장</span>`;
            closeBtn.style.cursor = 'default';
        } else {
            closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        }

        header.appendChild(indicatorWrap);
        header.appendChild(closeBtn);

        // ── 슬라이드 ──
        const slideWrapper = document.createElement('div');
        slideWrapper.className = 'pb-slide-wrapper';
        const slideTrack = document.createElement('div');
        slideTrack.className = 'pb-slide-track';

        images.forEach((img) => {
            const item = document.createElement('a');
            item.className = 'pb-slide-item';
            item.href = img.link || '#';
            if (img.link && img.link !== '#') item.target = '_blank';
            item.rel = 'noopener noreferrer';

            if (img.url) {
                const imgEl = document.createElement('img');
                imgEl.src = img.url;
                imgEl.alt = img.alt || '';
                item.appendChild(imgEl);
            } else {
                // 이미지 URL 미설정 시 플레이스홀더
                item.style.cssText = 'display:flex;align-items:center;justify-content:center;background:#F5F7FA;flex-direction:column;gap:6px;';
                item.innerHTML = `
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style="font-size:12px;color:#9CA3AF;">이미지 미설정</span>`;
            }

            slideTrack.appendChild(item);
        });

        slideWrapper.appendChild(slideTrack);

        // ── 푸터 ("N일간 보지 않기") ──
        const footer = document.createElement('div');
        footer.className = 'pb-footer';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'pb-hide-checkbox';
        checkbox.id = `pb-hide-${pageId}`;
        const footerLabel = document.createElement('label');
        footerLabel.className = 'pb-hide-label';
        footerLabel.htmlFor = checkbox.id;
        footerLabel.textContent = `${hideDays}일간 보지 않기`;
        footer.appendChild(checkbox);
        footer.appendChild(footerLabel);

        sheetEl.appendChild(header);
        sheetEl.appendChild(slideWrapper);
        sheetEl.appendChild(footer);

        // ── DOM 삽입 ──
        if (isEditor) {
            element.appendChild(sheetEl);
        } else {
            document.body.appendChild(sheetEl);
        }

        // ── 초기 인디케이터 ──
        syncIndicators(dots, 0);

        // ── 슬라이드 이동 ──
        function goTo(index) {
            currentIndex = Math.max(0, Math.min(index, images.length - 1));
            slideTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            syncIndicators(dots, currentIndex);
        }

        // ── 팝업 닫기 (뷰어 전용) ──
        function closePopup() {
            if (isEditor) return; // 에디터에서는 시트 유지 — 재편집 진입점 보존
            if (checkbox.checked) saveHideUntil(pageId, hideDays);
            if (overlay) overlay.classList.remove('pb-visible');
            sheetEl.classList.remove('pb-visible');
            setTimeout(() => {
                overlay?.remove();
                sheetEl.remove();
            }, 260);
        }

        // ── 터치 스와이프 ──
        let touchStartX = 0;
        let touchDeltaX = 0;

        function onTouchStart(e) { touchStartX = e.touches[0].clientX; touchDeltaX = 0; }
        function onTouchMove(e) { touchDeltaX = e.touches[0].clientX - touchStartX; }
        function onTouchEnd() {
            if (Math.abs(touchDeltaX) > 40) goTo(touchDeltaX < 0 ? currentIndex + 1 : currentIndex - 1);
            touchDeltaX = 0;
        }

        // ── ESC 키 닫기 ──
        function onKeyDown(e) { if (e.key === 'Escape') closePopup(); }

        // ── 이벤트 등록 ──
        if (!isEditor) {
            const onOverlayClick = () => closePopup();
            overlay.addEventListener('click', onOverlayClick);
            handlers.push(() => overlay.removeEventListener('click', onOverlayClick));

            document.addEventListener('keydown', onKeyDown);
            handlers.push(() => document.removeEventListener('keydown', onKeyDown));
        }

        closeBtn.addEventListener('click', closePopup);
        handlers.push(() => closeBtn.removeEventListener('click', closePopup));

        slideWrapper.addEventListener('touchstart', onTouchStart, { passive: true });
        slideWrapper.addEventListener('touchmove', onTouchMove, { passive: true });
        slideWrapper.addEventListener('touchend', onTouchEnd);
        handlers.push(() => {
            slideWrapper.removeEventListener('touchstart', onTouchStart);
            slideWrapper.removeEventListener('touchmove', onTouchMove);
            slideWrapper.removeEventListener('touchend', onTouchEnd);
        });

        // ── 팝업 표시 (뷰어만) ──
        if (!isEditor) {
            requestAnimationFrame(() => {
                overlay.classList.add('pb-visible');
                sheetEl.classList.add('pb-visible');
            });
        }

        return { closePopup, handlers, overlay, sheetEl };
    },

    unmount(element, instance) {
        if (!instance) return;
        instance.handlers?.forEach((fn) => fn());
        instance.overlay?.remove();
        instance.sheetEl?.remove();
    },
};
