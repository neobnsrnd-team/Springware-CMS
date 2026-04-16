// src/components/view/ViewClient.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nextApi } from '@/lib/api-url';

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

        // ── branch-locator 필터 버튼 ──
        // 인라인 <script>가 dangerouslySetInnerHTML 환경에서 실행 안 되므로 직접 처리
        const blCleanups: (() => void)[] = [];
        document.querySelectorAll<HTMLElement>('[data-component-id^="branch-locator"]').forEach((root) => {
            const filterBtns = Array.from(root.querySelectorAll<HTMLElement>('[data-bl-filter]'));
            const branchItems = Array.from(root.querySelectorAll<HTMLElement>('[data-bl-item]'));
            // ── 바텀시트 드래그 핸들 ──
            // flex 흐름 유지: 지도(flex:1) → 필터(고정) → 시트(명시 높이)
            // 시트 줄이면 지도가 자연 확장 → 지도가 필터 뒤로 침범하지 않음
            const sheet = root.querySelector<HTMLElement>('[data-bl-sheet]');
            const handle = root.querySelector<HTMLElement>('[data-bl-handle]');
            const mapArea = root.querySelector<HTMLElement>('[data-bl-map]')?.parentElement ?? null;
            if (sheet && handle) {
                let dragY = 0;
                let dragH = 0;
                let dragging = false;
                let moved = false;

                // 원본 style 속성 저장 — 복원 시 완벽하게 되돌리기 위해
                const origRootStyle = root.getAttribute('style') ?? '';
                const origMapStyle = mapArea?.getAttribute('style') ?? '';
                const origSheetStyle = sheet.getAttribute('style') ?? '';

                const activateLayout = () => {
                    root.style.height = `${root.offsetHeight}px`;
                    root.style.minHeight = '0';
                    root.style.overflow = 'hidden';
                    if (mapArea) {
                        mapArea.style.aspectRatio = 'unset';
                        mapArea.style.flex = '1';
                    }
                    sheet.style.flex = 'none';
                    sheet.style.minHeight = '0';
                    sheet.style.height = `${dragH}px`;
                    sheet.style.transition = 'none';
                };
                const onStart = (e: MouseEvent | TouchEvent) => {
                    e.preventDefault();
                    dragging = true;
                    moved = false;
                    dragY = 'touches' in e ? e.touches[0].clientY : e.clientY;
                    dragH = sheet.offsetHeight;
                };
                const onMove = (e: MouseEvent | TouchEvent) => {
                    if (!dragging) return;
                    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
                    if (!moved) {
                        if (Math.abs(y - dragY) < 25) return;
                        moved = true;
                        activateLayout();
                    }
                    e.preventDefault();
                    const maxH = root.offsetHeight * 0.85;
                    const newH = Math.max(24, Math.min(maxH, dragH + (dragY - y)));
                    sheet.style.height = `${newH}px`;
                };
                const restoreAll = () => {
                    root.setAttribute('style', origRootStyle);
                    if (mapArea) mapArea.setAttribute('style', origMapStyle);
                    sheet.setAttribute('style', origSheetStyle);
                };
                const initH = sheet.offsetHeight;
                const onEnd = () => {
                    if (!dragging) return;
                    dragging = false;
                    if (!moved) return;
                    sheet.style.transition = 'height 0.25s ease';
                    const h = sheet.offsetHeight;
                    const diff = Math.abs(h - dragH);
                    if (diff < 20) {
                        restoreAll();
                    } else if (h < initH * 0.4) {
                        sheet.style.height = '24px';
                    } else if (h > initH * 1.2) {
                        sheet.style.height = `${Math.round(root.offsetHeight * 0.75)}px`;
                    } else {
                        restoreAll();
                    }
                };

                handle.addEventListener('mousedown', onStart);
                handle.addEventListener('touchstart', onStart, { passive: false });
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
                blCleanups.push(() => {
                    handle.removeEventListener('mousedown', onStart);
                    handle.removeEventListener('touchstart', onStart);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('mouseup', onEnd);
                    document.removeEventListener('touchend', onEnd);
                });
            }

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

            // ── 아이템 클릭 → 지도 src 교체 (Issue #332) ──
            // VIEWER_SCRIPT와 달리 dangerouslySetInnerHTML 환경에서 확실히 동작
            const mapIframe = root.querySelector<HTMLIFrameElement>('[data-bl-map]');
            const mapPlaceholder = root.querySelector<HTMLElement>('[data-bl-map-ph]');
            const defaultMapSrc = mapIframe?.getAttribute('src') ?? 'about:blank';

            const sanitizeMapSrc = (url: string): string => {
                const t = url.trim();
                if (
                    t.startsWith('https://www.google.com/maps/embed') ||
                    t.startsWith('https://maps.google.com/maps?') ||
                    t.startsWith('https://map.kakao.com/link/embed')
                )
                    return t;
                return 'about:blank';
            };

            branchItems.forEach((item) => {
                item.style.cursor = 'pointer';
                const onItemClick = (e: MouseEvent) => {
                    if ((e.target as HTMLElement).closest('a[href^="tel:"]')) return;
                    const src = sanitizeMapSrc(item.getAttribute('data-bl-map-src') ?? '');
                    const effectiveSrc = src !== 'about:blank' ? src : sanitizeMapSrc(defaultMapSrc);
                    if (mapIframe) mapIframe.setAttribute('src', effectiveSrc);
                    if (mapPlaceholder) mapPlaceholder.style.display = effectiveSrc !== 'about:blank' ? 'none' : 'flex';
                    branchItems.forEach((x) => {
                        x.style.background = x === item ? '#EEF4FF' : '';
                    });
                };
                item.addEventListener('click', onItemClick);
                blCleanups.push(() => item.removeEventListener('click', onItemClick));
            });
        });

        // menu-tab-grid sticky 강제 보장
        // dangerouslySetInnerHTML + script 재실행 환경에서 ContentBuilderRuntime이
        // 비동기로 .row 스타일을 재처리할 수 있으므로, 이중 rAF로 보장
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.querySelectorAll<HTMLElement>('[data-menu-sticky="true"]').forEach((block) => {
                    const row = block.closest<HTMLElement>('.row');
                    if (row) {
                        row.style.position = 'sticky';
                        row.style.top = '0';
                        row.style.zIndex = '100';
                        row.style.background = '#ffffff';
                    }
                });
            });
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
    }, [viewMode, embed, html]);

    // ── 반응형 모드: 툴바 + iframe ─────────────────────────────────────────
    if (viewMode === 'responsive' && !embed) {
        const iframeSrc = nextApi(`/view?bank=${bank ?? 'ibk'}&embed=1`);

        return (
            // height:100vh + overflow:hidden → 툴바를 제외한 나머지 높이를 iframe이 flex로 채움
            // (magic number calc(100vh - Npx) 없이 툴바 높이를 자동 반영)
            <div
                style={{
                    background: '#dde1e7',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* 툴바 — flexShrink:0으로 높이 고정, iframe 영역이 나머지를 채움 */}
                <div
                    style={{
                        flexShrink: 0,
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

                {/* iframe 영역 — flex:1로 툴바 이후 나머지 높이 전부 차지, iframe이 100% 채움 */}
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '24px 0' }}>
                    <div
                        ref={iframeWrapperRef}
                        style={{
                            width: `${RESPONSIVE_MAX}px`, // useEffect에서 window.innerWidth로 교정
                            maxWidth: '100%',
                            height: '100%',
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
                                height: '100%',
                                border: 'none',
                                display: 'block',
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
