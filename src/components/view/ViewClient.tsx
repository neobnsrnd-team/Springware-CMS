// src/components/view/ViewClient.tsx
'use client';

import { useEffect } from 'react';

// Runtime library for rendering ContentBuilder-generated content
import ContentBuilderRuntime from '@innovastudio/contentbuilder-runtime';
import '@innovastudio/contentbuilder-runtime/dist/contentbuilder-runtime.css';

type Props = {
    html: string;
};

export default function ViewClient({ html }: Props) {
    useEffect(() => {
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

                // ── IBK 금융 모바일 컴포넌트 ──
                'product-gallery': {
                    url: basePath + '/assets/plugins/product-gallery/index.js',
                    css: basePath + '/assets/plugins/product-gallery/style.css',
                },
                'exchange-board': {
                    url: basePath + '/assets/plugins/exchange-board/index.js',
                    css: basePath + '/assets/plugins/exchange-board/style.css',
                },
                'branch-locator': {
                    url: basePath + '/assets/plugins/branch-locator/index.js',
                    css: basePath + '/assets/plugins/branch-locator/style.css',
                },
                'promo-banner': {
                    url: basePath + '/assets/plugins/promo-banner/index.js',
                    css: basePath + '/assets/plugins/promo-banner/style.css',
                },
                'media-video': {
                    url: basePath + '/assets/plugins/media-video/index.js',
                    css: basePath + '/assets/plugins/media-video/style.css',
                },
                'loan-calculator': {
                    url: basePath + '/assets/plugins/loan-calculator/index.js',
                    css: basePath + '/assets/plugins/loan-calculator/style.css',
                },
                'auth-center': {
                    url: basePath + '/assets/plugins/auth-center/index.js',
                    css: basePath + '/assets/plugins/auth-center/style.css',
                },
                'app-header': {
                    url: basePath + '/assets/plugins/app-header/index.js',
                    css: basePath + '/assets/plugins/app-header/style.css',
                },
                'product-menu': {
                    url: basePath + '/assets/plugins/product-menu/index.js',
                    css: basePath + '/assets/plugins/product-menu/style.css',
                },
                'site-footer': {
                    url: basePath + '/assets/plugins/site-footer/index.js',
                    css: basePath + '/assets/plugins/site-footer/style.css',
                },
            },
        });
        runtime.init();

        return () => runtime.destroy();
    }, []);

    return (
        <div style={{ background: '#dde1e7', minHeight: '100vh', padding: '40px 0 80px' }}>
            {/* 모바일 앱 화면 미리보기 — 390px 폰 크기 */}
            <div
                suppressHydrationWarning
                className="is-container"
                style={{
                    maxWidth: '390px',
                    margin: '0 auto',
                    width: '100%',
                    background: '#ffffff',
                    minHeight: '700px',
                    boxShadow: '0 8px 48px rgba(0,70,164,0.10)',
                    padding: 0,
                }}
                dangerouslySetInnerHTML={{ __html: html || '' }}
            />
        </div>
    );
}
