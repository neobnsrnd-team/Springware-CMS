// src/components/view/ViewClient.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Runtime library for rendering ContentBuilder-generated content
import ContentBuilderRuntime from '@innovastudio/contentbuilder-runtime';
import '@innovastudio/contentbuilder-runtime/dist/contentbuilder-runtime.css';

// 반응형 미리보기 슬라이더 프리셋
const RESPONSIVE_PRESETS = [
    { label: '모바일', width: 390 },
    { label: '태블릿', width: 768 },
    { label: '데스크탑', width: 1280 },
];

const RESPONSIVE_MIN = 320;
const RESPONSIVE_MAX = 1440;

type Props = {
    html: string;
    viewMode: 'mobile' | 'web' | 'responsive';
    /** 반응형 iframe src 생성에 필요한 페이지 ID */
    bank?: string;
    /** true이면 iframe 내부 렌더링 — 툴바 없이 콘텐츠만 표시 */
    embed?: boolean;
};

export default function ViewClient({ html, viewMode, bank, embed }: Props) {
    // 반응형 모드 툴바용 너비 상태
    const [responsiveWidth, setResponsiveWidth] = useState<number>(RESPONSIVE_MAX);
    const iframeWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (viewMode === 'responsive' && !embed) {
            const initial = Math.min(window.innerWidth, RESPONSIVE_MAX);
            setResponsiveWidth(initial);
            if (iframeWrapperRef.current) iframeWrapperRef.current.style.width = `${initial}px`;
        }
    }, [viewMode, embed]);

    // 뷰 모드를 body 속성으로 노출 — 플러그인(popup-banner 등)에서 CSS로 감지
    useEffect(() => {
        // responsive + !embed는 iframe 껍데기 — 실제 콘텐츠는 embed iframe 내부에서 처리
        if (viewMode === 'responsive' && !embed) return;
        document.body.setAttribute('data-view-mode', viewMode);
        return () => {
            document.body.removeAttribute('data-view-mode');
        };
    }, [viewMode, embed]);

    const applyWidth = useCallback((width: number) => {
        setResponsiveWidth(width);
        if (iframeWrapperRef.current) iframeWrapperRef.current.style.width = `${width}px`;
    }, []);

    useEffect(() => {
        // 반응형 모드에서 툴바 쪽(비embed)은 iframe을 사용하므로 런타임 초기화 불필요
        if (viewMode === 'responsive' && !embed) return;

        const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));

        // Initialize runtime
        const runtime = new ContentBuilderRuntime({
            // Registers available plugins (not yet loaded).
            // Scripts and styles are fetched only when the plugin is actually used in content.
            plugins: {
                'logo-loop': {
                    url: basePath + '/assets/plugins/logo-loop/index.js',
                    css: basePath + '/assets/plugins/logo-loop/style.css',
                },
                'click-counter': {
                    url: basePath + '/assets/plugins/click-counter/index.js',
                    css: basePath + '/assets/plugins/click-counter/style.css',
                },
                'card-list': {
                    url: basePath + '/assets/plugins/card-list/index.js',
                    css: basePath + '/assets/plugins/card-list/style.css',
                },
                accordion: {
                    url: basePath + '/assets/plugins/accordion/index.js',
                    css: basePath + '/assets/plugins/accordion/style.css',
                },
                'hero-animation': {
                    url: basePath + '/assets/plugins/hero-animation/index.js',
                    css: basePath + '/assets/plugins/hero-animation/style.css',
                },
                'animated-stats': {
                    url: basePath + '/assets/plugins/animated-stats/index.js',
                    css: basePath + '/assets/plugins/animated-stats/style.css',
                },
                timeline: {
                    url: basePath + '/assets/plugins/timeline/index.js',
                    css: basePath + '/assets/plugins/timeline/style.css',
                },
                'before-after-slider': {
                    url: basePath + '/assets/plugins/before-after-slider/index.js',
                    css: basePath + '/assets/plugins/before-after-slider/style.css',
                },
                'more-info': {
                    url: basePath + '/assets/plugins/more-info/index.js',
                    css: basePath + '/assets/plugins/more-info/style.css',
                },
                'social-share': {
                    url: basePath + '/assets/plugins/social-share/index.js',
                    css: basePath + '/assets/plugins/social-share/style.css',
                },
                pendulum: {
                    url: basePath + '/assets/plugins/pendulum/index.js',
                    css: basePath + '/assets/plugins/pendulum/style.css',
                },
                'browser-mockup': {
                    url: basePath + '/assets/plugins/browser-mockup/index.js',
                    css: basePath + '/assets/plugins/browser-mockup/style.css',
                },
                'hero-background': {
                    url: basePath + '/assets/plugins/hero-background/index.js',
                    css: basePath + '/assets/plugins/hero-background/style.css',
                },
                'cta-buttons': {
                    url: basePath + '/assets/plugins/cta-buttons/index.js',
                    css: basePath + '/assets/plugins/cta-buttons/style.css',
                },

                'media-slider': {
                    url: basePath + '/assets/plugins/media-slider/index.js',
                    css: basePath + '/assets/plugins/media-slider/style.css',
                },
                'media-grid': {
                    url: basePath + '/assets/plugins/media-grid/index.js',
                    css: basePath + '/assets/plugins/media-grid/style.css',
                },
                'particle-constellation': {
                    url: basePath + '/assets/plugins/particle-constellation/index.js',
                    css: basePath + '/assets/plugins/particle-constellation/style.css',
                },
                'vector-force': {
                    url: basePath + '/assets/plugins/vector-force/index.js',
                    css: basePath + '/assets/plugins/vector-force/style.css',
                },
                'aurora-glow': {
                    url: basePath + '/assets/plugins/aurora-glow/index.js',
                    css: basePath + '/assets/plugins/aurora-glow/style.css',
                },
                'simple-stats': {
                    url: basePath + '/assets/plugins/simple-stats/index.js',
                    css: basePath + '/assets/plugins/simple-stats/style.css',
                },
                faq: {
                    url: basePath + '/assets/plugins/faq/index.js',
                    css: basePath + '/assets/plugins/faq/style.css',
                },
                'callout-box': {
                    url: basePath + '/assets/plugins/callout-box/index.js',
                    css: basePath + '/assets/plugins/callout-box/style.css',
                },
                code: {
                    url: basePath + '/assets/plugins/code/index.js',
                    css: basePath + '/assets/plugins/code/style.css',
                },
                'video-embed': {
                    // Experimental
                    url: basePath + '/assets/plugins/video-embed/index.js',
                    css: basePath + '/assets/plugins/video-embed/style.css',
                },
                'swiper-slider': {
                    url: basePath + '/assets/plugins/swiper-slider/index.js',
                    css: basePath + '/assets/plugins/swiper-slider/style.css',
                },

                // ── 금융 모바일 컴포넌트 (플러그인 유지 대상) ──
                // 순수 HTML 변환 완료분은 등록 제거 — 런타임 재개입 방지
                // (app-header, product-menu, auth-center, media-video, site-footer, product-gallery, promo-banner, branch-locator)
                'exchange-board': {
                    url: basePath + '/assets/plugins/exchange-board/index.js',
                    css: basePath + '/assets/plugins/exchange-board/style.css',
                },
                'loan-calculator': {
                    url: basePath + '/assets/plugins/loan-calculator/index.js',
                    css: basePath + '/assets/plugins/loan-calculator/style.css',
                },
                'popup-banner': {
                    url: basePath + '/assets/plugins/popup-banner/index.js',
                    css: basePath + '/assets/plugins/popup-banner/style.css',
                },
                'sticky-floating-bar': {
                    url: basePath + '/assets/plugins/sticky-floating-bar/index.js',
                    css: basePath + '/assets/plugins/sticky-floating-bar/style.css',
                },
            },
        });
        runtime.init();

        // dangerouslySetInnerHTML은 <script> 태그를 실행하지 않으므로
        // [data-spw-block] 컴포넌트 내 인라인 스크립트를 직접 재실행
        // replaceChild로 동일 위치에 삽입 → document.currentScript.parentElement가 컴포넌트 div를 가리킴
        // 스크립트 실행 전 dot 컨테이너를 초기화하는 코드를 주입 —
        // runtime.init() 이중 실행, React StrictMode 이중 실행 등 어떤 경로로든
        // 스크립트가 여러 번 실행되어도 dot 개수가 누적되지 않도록 보장
        const clearDotsCode = `(function() {
    const block = document.currentScript?.closest('[data-spw-block]');
    if (block) {
        block.querySelectorAll('[data-pg-dots], [data-pb-dots]').forEach(function(dotsContainer) {
            dotsContainer.innerHTML = '';
        });
    }
})();`;
        // data-accordion-inited / data-menu-tab-inited guard 초기화 — 에디터에서 설정된 채
        // 저장된 경우 스크립트가 즉시 return해 이벤트 리스너가 등록되지 않으므로,
        // 재실행 전에 속성을 제거한다.
        document.querySelectorAll<HTMLElement>('[data-spw-block][data-accordion-inited]').forEach((el) => {
            el.removeAttribute('data-accordion-inited');
        });
        document.querySelectorAll<HTMLElement>('[data-spw-block][data-menu-tab-inited]').forEach((el) => {
            el.removeAttribute('data-menu-tab-inited');
        });
        document.querySelectorAll<HTMLElement>('[data-spw-block][data-card-slide-inited]').forEach((el) => {
            el.removeAttribute('data-card-slide-inited');
        });

        document.querySelectorAll<HTMLScriptElement>('[data-spw-block] script').forEach((oldScript) => {
            // 외부 스크립트(src), 비 JS 타입(type="text/html" 등), HTML 템플릿 스크립트를 제외합니다.
            if (
                oldScript.src ||
                (oldScript.type && !/javascript|ecmascript/i.test(oldScript.type)) ||
                (oldScript.textContent ?? '').trimStart().startsWith('<')
            ) {
                return;
            }
            const newScript = document.createElement('script');
            newScript.textContent = clearDotsCode + (oldScript.textContent ?? '');
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        // benefit-card mobile scroll-snap 직접 변환
        // dangerouslySetInnerHTML + replaceChild 환경에서 document.currentScript가
        // null을 반환하는 경우를 대비해 ViewClient에서 직접 처리
        document.querySelectorAll<HTMLElement>('[data-bc-track]').forEach((track) => {
            track.className = (track.className || '').replace(/\bflex(?:-col)?\b/g, '').trim();
            track.style.cssText =
                'display:flex;flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;' +
                '-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;' +
                'gap:0;padding:4px 0 8px;';
            track.querySelectorAll<HTMLElement>('[data-bc-slide]').forEach((slide) => {
                slide.style.cssText =
                    'flex-shrink:0;width:80%;scroll-snap-align:start;padding:0 8px;box-sizing:border-box;';
            });
        });

        // ── branch-locator 필터 버튼 + 지도 플레이스홀더 + 바텀시트 드래그 ──
        // 인라인 <script> 방식은 dangerouslySetInnerHTML 환경에서 파싱 에러를 유발하므로
        // ViewClient에서 직접 처리
        const blCleanups: (() => void)[] = [];
        document.querySelectorAll<HTMLElement>('[data-component-id^="branch-locator"]').forEach((root) => {
            // 지도 플레이스홀더: embed URL이 있으면 숨김
            const mapIframe = root.querySelector<HTMLIFrameElement>('[data-bl-map]');
            const mapPh = root.querySelector<HTMLElement>('[data-bl-map-ph]');
            const mapSrc = mapIframe?.getAttribute('src') ?? '';
            if (mapIframe && mapPh && mapSrc && mapSrc !== 'about:blank') {
                mapPh.style.display = 'none';
            }

            // 필터 버튼
            const filterBtns = Array.from(root.querySelectorAll<HTMLElement>('[data-bl-filter]'));
            const branchItems = Array.from(root.querySelectorAll<HTMLElement>('[data-bl-item]'));
            filterBtns.forEach((btn) => {
                const onClick = () => {
                    const filterType = btn.getAttribute('data-bl-filter');
                    filterBtns.forEach((x) => {
                        const isActive = x === btn;
                        x.style.background = isActive ? '#0046A4' : '#fff';
                        x.style.color = isActive ? '#fff' : '#6B7280';
                    });
                    branchItems.forEach((item) => {
                        item.style.display =
                            filterType === 'all' || item.getAttribute('data-bl-item') === filterType ? 'flex' : 'none';
                    });
                };
                btn.addEventListener('click', onClick);
                blCleanups.push(() => btn.removeEventListener('click', onClick));
            });

            // 바텀시트 드래그 — absolute 포지션 방식
            // flex 내부에서 height를 변경하면 부모 전체가 늘어나/줄어드므로
            // absolute bottom:0으로 지도 위에 겹치는 방식 사용
            const sheet = root.querySelector<HTMLElement>('[data-bl-sheet]');
            const handle = root.querySelector<HTMLElement>('[data-bl-handle]');
            if (sheet && handle) {
                // 루트를 기준 컨테이너로, overflow 차단
                root.style.position = 'relative';
                root.style.overflow = 'hidden';

                // 바텀시트를 absolute로 전환
                const defaultH = Math.min(sheet.offsetHeight, root.offsetHeight * 0.5);
                sheet.style.position = 'absolute';
                sheet.style.bottom = '0';
                sheet.style.left = '0';
                sheet.style.right = '0';
                sheet.style.height = `${defaultH}px`;
                sheet.style.minHeight = '0';
                sheet.style.flex = 'none';
                sheet.style.zIndex = '10';

                let startY = 0;
                let startH = 0;
                let dragging = false;
                const MIN_H = 48; // 핸들만 보이는 접힌 상태
                const MAX_RATIO = 0.85; // 루트 높이의 85%까지

                const onStart = (e: MouseEvent | TouchEvent) => {
                    dragging = true;
                    startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
                    startH = sheet.offsetHeight;
                    sheet.style.transition = 'none';
                };
                const onMove = (e: MouseEvent | TouchEvent) => {
                    if (!dragging) return;
                    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
                    const maxH = root.offsetHeight * MAX_RATIO;
                    sheet.style.height = `${Math.max(MIN_H, Math.min(maxH, startH + (startY - y)))}px`;
                };
                const onEnd = () => {
                    if (!dragging) return;
                    dragging = false;
                    sheet.style.transition = 'height 0.3s ease';
                    const h = sheet.offsetHeight;
                    if (h < 100) {
                        sheet.style.height = `${MIN_H}px`;
                    } else if (h > root.offsetHeight * 0.6) {
                        sheet.style.height = `${root.offsetHeight * 0.7}px`;
                    } else {
                        sheet.style.height = `${defaultH}px`;
                    }
                };

                handle.addEventListener('touchstart', onStart, { passive: true });
                handle.addEventListener('mousedown', onStart);
                document.addEventListener('touchmove', onMove, { passive: true });
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchend', onEnd);
                document.addEventListener('mouseup', onEnd);
                blCleanups.push(() => {
                    handle.removeEventListener('touchstart', onStart);
                    handle.removeEventListener('mousedown', onStart);
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('touchend', onEnd);
                    document.removeEventListener('mouseup', onEnd);
                });
            }
        });

        // 금융 컴포넌트 내 더미 링크(href="#") 클릭 시 상단 이동 차단
        // ContentBuilder가 onclick 속성을 제거하므로 이벤트 위임으로 처리
        const handleDummyLink = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-spw-block] a[href="#"]');
            if (anchor) e.preventDefault();
        };
        document.addEventListener('click', handleDummyLink);

        return () => {
            blCleanups.forEach((fn) => fn());
            document.removeEventListener('click', handleDummyLink);
            runtime.destroy();
        };
    }, [viewMode, embed]);

    // ── 반응형 모드: 툴바 + iframe ─────────────────────────────────────────
    if (viewMode === 'responsive' && !embed) {
        const iframeSrc = `/view?bank=${bank ?? 'ibk'}&embed=1`;

        return (
            <div style={{ background: '#dde1e7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* 툴바 */}
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 50,
                        background: '#ffffff',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '10px 24px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                >
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {RESPONSIVE_PRESETS.map(({ label, width }) => (
                            <button
                                key={width}
                                onClick={() => applyWidth(width)}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '5px',
                                    border: '1px solid',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    borderColor: responsiveWidth === width ? '#0046A4' : '#e5e7eb',
                                    background: responsiveWidth === width ? '#EEF4FF' : '#ffffff',
                                    color: responsiveWidth === width ? '#0046A4' : '#6b7280',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <input
                        type="range"
                        min={RESPONSIVE_MIN}
                        max={RESPONSIVE_MAX}
                        value={responsiveWidth}
                        onChange={(e) => applyWidth(Number(e.target.value))}
                        style={{ width: '200px', accentColor: '#0046A4' }}
                    />
                    <span
                        style={{
                            fontSize: '13px',
                            color: '#374151',
                            fontVariantNumeric: 'tabular-nums',
                            minWidth: '60px',
                        }}
                    >
                        {responsiveWidth}px
                    </span>
                </div>

                {/* iframe 래퍼 — 너비만 직접 조작, iframe 자체는 100% */}
                <div style={{ padding: '32px 0 80px', flex: 1 }}>
                    <div
                        ref={iframeWrapperRef}
                        style={{
                            width: `${RESPONSIVE_MAX}px`, // useEffect에서 window.innerWidth로 교정
                            maxWidth: '100%',
                            margin: '0 auto',
                            transition: 'width 0.1s ease',
                            boxShadow: '0 8px 48px rgba(0,70,164,0.10)',
                            background: '#ffffff',
                        }}
                    >
                        <iframe
                            src={iframeSrc}
                            style={{
                                width: '100%',
                                minHeight: '700px',
                                border: 'none',
                                display: 'block',
                            }}
                            // iframe 높이를 내용에 맞게 자동 조정
                            onLoad={(e) => {
                                const iframe = e.target as HTMLIFrameElement;
                                try {
                                    const doc = iframe.contentDocument;
                                    if (doc) {
                                        iframe.style.height = `${doc.documentElement.scrollHeight}px`;
                                    }
                                } catch {
                                    // cross-origin 등으로 접근 불가한 경우 무시
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── mobile / web 모드: 직접 렌더링 ───────────────────────────────────
    return (
        <div
            style={{
                background: embed ? 'transparent' : '#dde1e7',
                minHeight: '100vh',
                padding: viewMode === 'web' || embed ? '0' : '32px 0 80px',
            }}
        >
            <div
                suppressHydrationWarning
                className="is-container"
                style={{
                    maxWidth: viewMode === 'mobile' ? '390px' : '100%',
                    margin: viewMode === 'mobile' ? '0 auto' : '0',
                    width: '100%',
                    background: '#ffffff',
                    minHeight: '100vh',
                    boxShadow: viewMode === 'mobile' ? '0 8px 48px rgba(0,70,164,0.10)' : 'none',
                    padding: 0,
                }}
                dangerouslySetInnerHTML={{ __html: html || '' }}
            />
        </div>
    );
}
