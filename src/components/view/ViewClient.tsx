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
                // (app-header, product-menu, auth-center, media-video, site-footer, product-gallery, promo-banner)
                'exchange-board': {
                    url: basePath + '/assets/plugins/exchange-board/index.js',
                    css: basePath + '/assets/plugins/exchange-board/style.css',
                },
                'branch-locator': {
                    url: basePath + '/assets/plugins/branch-locator/index.js',
                    css: basePath + '/assets/plugins/branch-locator/style.css',
                },
                'loan-calculator': {
                    url: basePath + '/assets/plugins/loan-calculator/index.js',
                    css: basePath + '/assets/plugins/loan-calculator/style.css',
                },
            },
        });
        runtime.init();

        // dangerouslySetInnerHTML은 <script> 태그를 실행하지 않으므로
        // [data-spw-block] 컴포넌트 내 인라인 스크립트를 직접 재실행
        // replaceChild로 동일 위치에 삽입 → document.currentScript.parentElement가 컴포넌트 div를 가리킴
        document.querySelectorAll<HTMLScriptElement>('[data-spw-block] script').forEach((oldScript) => {
            const newScript = document.createElement('script');
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        return () => runtime.destroy();
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
