'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react'

// Runtime library for rendering ContentBuilder-generated content
import ContentBuilderRuntime from '@innovastudio/contentbuilder-runtime'
import '@innovastudio/contentbuilder-runtime/dist/contentbuilder-runtime.css'

// ContentBuilder library for editing
import ContentBuilder from '@innovastudio/contentbuilder'
import '@innovastudio/contentbuilder/public/contentbuilder/contentbuilder.css'

import ComponentPanel from './ComponentPanel'
import { FINANCE_COMPONENTS } from './finance-component-data'
import ko from './ko'

// content-plugins.js data_basic 스니펫 타입
export interface BasicBlock {
    thumbnail: string; // 예: 'preview/basic-01b.png'
    html: string;
    category: string;
    viewMode: 'mobile' | 'web' | 'responsive';
}

// 캔버스에 올라간 블록 하나를 나타내는 타입
export interface ParsedBlock {
    id: string;
    cbType: string;   // data-cb-type 값 (금융 컴포넌트 아닌 경우 빈 문자열)
    label: string;    // 블록 이름 (금융 컴포넌트면 한글명, 아니면 타입명)
    preview: string;  // 썸네일 경로 (금융 컴포넌트만 존재)
    outerHtml: string; // ContentBuilder가 감싼 전체 HTML
}

/**
 * ContentBuilder의 현재 HTML을 파싱하여 모든 블록 목록을 반환합니다.
 *
 * ContentBuilder는 각 블록을 <div class="row"><div class="column">...</div></div>
 * 구조로 감쌉니다. 이 함수는 최상위 row 요소 하나를 블록 하나로 취급합니다.
 * - row 안에 [data-cb-type] 포함 → 금융 컴포넌트 블록
 * - 그 외 → 기본 블록 (텍스트 미리보기 사용)
 *
 * outerHtml에는 row 전체를 저장하므로 reorder 시
 * loadHtml(rows.join(''))으로 ContentBuilder 구조가 그대로 복원됩니다.
 */
function parseBuilderBlocks(html: string): ParsedBlock[] {
    if (!html?.trim()) return [];
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // ContentBuilder의 최상위 row 요소들 (직계 자식)
    const rows = Array.from(doc.body.children);

    return rows.map((row, i) => {
        const rowEl = row as HTMLElement;

        // 금융 컴포넌트 row 확인
        const pluginEl = rowEl.querySelector('[data-cb-type]');
        if (pluginEl) {
            const cbType = pluginEl.getAttribute('data-cb-type') ?? '';
            const comp = FINANCE_COMPONENTS.find(c => c.id === cbType);
            return {
                id: `block-${i}-${cbType}`,
                cbType,
                label: comp?.label ?? (cbType || `컴포넌트 ${i + 1}`),
                preview: comp?.preview ?? '',
                outerHtml: rowEl.outerHTML,
            };
        }

        // 기본 블록 — 텍스트 내용 앞 25자를 레이블로 사용
        const text = rowEl.textContent?.trim().replace(/\s+/g, ' ') ?? '';
        const label = text.slice(0, 25) || `기본 블록 ${i + 1}`;
        return {
            id: `block-${i}-basic`,
            cbType: '',
            label,
            preview: '',
            outerHtml: rowEl.outerHTML,
        };
    });
}

const btnStyle: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#374151',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
};

// CMS 전체에서 공유하는 색상 팔레트 — 플러그인 에디터에서 window.__cmsColors로 접근
const CMS_COLORS = [
    // ── 은행 대표 색상 ──
    '#004B9C', '#0064C8', '#5B9BD5', '#BDD7EE',
    '#008C6A', '#00A887', '#5EC4A8', '#B7E3D8',
    '#FFBC00', '#FFD966', '#594A2E', '#C9B07A',
    '#003DA5', '#0046FF', '#5B78D5', '#B4C2F0',
    // ── 기본 팔레트 ──
    '#000000', '#404040', '#808080', '#BFBFBF', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFFF00', '#00FF00', '#00FFFF',
    '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
];
if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__cmsColors = CMS_COLORS;

interface TabData { id: string; label: string; viewMode: ViewMode }

const DEFAULT_TABS: TabData[] = [
    { id: 'ibk',     label: 'IBK demo',    viewMode: 'mobile' },
    { id: 'hana',    label: '하나 demo',   viewMode: 'mobile' },
    { id: 'kb',      label: 'KB demo',     viewMode: 'mobile' },
    { id: 'shinhan', label: '신한 demo',   viewMode: 'mobile' },
    { id: 'woori',   label: '우리 demo',   viewMode: 'mobile' },
    { id: 'nh',      label: 'NH농협 demo', viewMode: 'mobile' },
];

// 패널 너비 (접힌 상태: 40px, 펼친 상태: 264px) — CSS transition과 동기화
const PANEL_WIDTH_OPEN = 264;

// ── 뷰 모드 ──────────────────────────────────────────────────────────────
type ViewMode = 'mobile' | 'web' | 'responsive';

const VIEW_MODE_CONFIG: Record<ViewMode, { label: string; maxWidth: string; icon: string }> = {
    mobile:     { label: '모바일', maxWidth: '390px',  icon: '📱' },
    web:        { label: '웹',     maxWidth: '1280px', icon: '🖥️' },
    responsive: { label: '반응형', maxWidth: '100%',   icon: '🔄' },
};

export default function EditClient({ bank = 'ibk' }: { bank?: string }) {
    const builderRef = useRef<ContentBuilder | null>(null);         // ContentBuilder 인스턴스
    const runtimeRef = useRef<ContentBuilderRuntime | null>(null);  // Runtime 인스턴스
    const [containerOpacity, setContainerOpacity] = useState(0);

    // 컴포넌트 패널 드래그 상태
    // — ref: 동기 접근용 (dragover 이벤트 핸들러 내 즉시 참조)
    // — state: 리렌더링 트리거용 (오버레이 표시/숨김)
    const isDraggingRef = useRef(false);
    const [isDraggingComponent, setIsDraggingComponent] = useState(false);
    const [isDropOver, setIsDropOver] = useState(false);

    // 드롭 삽입 위치 인덱스 (−1 = 끝에 추가)
    const dropInsertIdxRef = useRef<number>(-1);
    // 시각적 삽입 선 위치 (viewport 기준 Y, null이면 비표시)
    const [dropLineY, setDropLineY] = useState<number | null>(null);

    // 현재 캔버스에 올라간 블록 목록 (순서 변경 패널에서 사용)
    const [canvasBlocks, setCanvasBlocks] = useState<ParsedBlock[]>([]);
    // ref: 이벤트 핸들러 클로저에서 최신 blocks를 동기적으로 참조
    const canvasBlocksRef = useRef<ParsedBlock[]>([]);
    useEffect(() => { canvasBlocksRef.current = canvasBlocks; }, [canvasBlocks]);

    // content-plugins.js 기본 블록 (우측 패널 "기본 블록" 탭에서 사용)
    const [basicBlocks, setBasicBlocks] = useState<BasicBlock[]>([]);

    // 기본 탭 목록 (localStorage 영속화 — 삭제 가능)
    // lazy initializer로 첫 렌더링 전에 localStorage를 읽어 삭제된 탭이 잠깐 보이는 현상 방지
    const [defaultTabs, setDefaultTabs] = useState<TabData[]>(() => {
        try {
            const saved = localStorage.getItem('cms-default-tabs');
            if (saved) return (JSON.parse(saved) as TabData[]).map(t => ({ ...t, viewMode: t.viewMode ?? 'mobile' }));
        } catch { /* 손상된 데이터 무시 */ }
        return DEFAULT_TABS;
    });
    // 사용자가 추가한 커스텀 탭 목록 (localStorage 영속화)
    const [customTabs, setCustomTabs] = useState<TabData[]>(() => {
        try {
            const saved = localStorage.getItem('cms-custom-tabs');
            if (saved) return (JSON.parse(saved) as TabData[]).map(t => ({ ...t, viewMode: t.viewMode ?? 'mobile' }));
        } catch { /* 손상된 데이터 무시 */ }
        return [];
    });
    // 탭 추가 인라인 입력 표시 여부
    const [showAddTab, setShowAddTab] = useState(false);
    // 탭 이름 입력값
    const [newTabName, setNewTabName] = useState('');
    // 새 탭 생성 시 선택할 뷰 모드
    const [newTabViewMode, setNewTabViewMode] = useState<ViewMode>('mobile');

    // ── 현재 탭의 뷰 모드 (생성 시 결정, 이후 변경 불가) ─────────────────
    const allTabs = [...defaultTabs, ...customTabs];
    const currentTab = allTabs.find(t => t.id === bank);
    const viewMode: ViewMode = currentTab?.viewMode ?? 'mobile';

    useEffect(() => {
        // 플러그인 재초기화 — 연속 호출 방지를 위해 300ms 디바운스
        // reinitialize(): Runtime이 data-cb-type 플러그인 DOM을 재마운트
        // applyBehavior(): ContentBuilder가 모든 row에 편집 이벤트 핸들러 재연결
        //   → reinitialize()가 플러그인 DOM을 교체하면 ContentBuilder가 앞쪽 row 참조를
        //     잃어 move/delete 버튼이 마지막 row에만 동작하는 문제를 방지합니다.
        let reinitTimer: ReturnType<typeof setTimeout> | null = null;
        const debouncedReinit = () => {
            if (reinitTimer) clearTimeout(reinitTimer);
            reinitTimer = setTimeout(async () => {
                // reinitialize()가 비동기(플러그인 JS/CSS lazy-load)이므로 완료 후 applyBehavior() 호출
                await runtimeRef.current?.reinitialize();
                builderRef.current?.applyBehavior();
                // ContentBuilder 자체 삭제/이동 후 순서 패널 동기화
                const html = builderRef.current?.html() ?? '';
                setCanvasBlocks(parseBuilderBlocks(html));
            }, 300);
        };
        // 툴바의 이동/복제/삭제 후 ContentBuilder 재연결을 위해 전역 노출
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).builderReinit = debouncedReinit;

        const upload = async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`/api/builder/upload`, { method: 'POST', body: formData });
            return response.json();
        };

        // Create ContentBuilder instance
        builderRef.current = new ContentBuilder({
            container: '.container',
            previewURL: 'preview-with-plugins.html',
            lang: ko,
            upload,

            // Enable Code Chat (supports OpenAI or OpenRouter)

            // clearChatSettings: true, // clear chat settings on load

            // OpenRouter:
            sendCommandUrl: '/api/openrouter',
            sendCommandStreamUrl: '/api/openrouter/stream',
            systemModel: 'openai/gpt-4o-mini', // Configure model for analyzing request
            codeModels: [ // Configure available models for code generation
                { id: 'anthropic/claude-opus-4.5', label: 'Claude Opus 4.5' },
                { id: 'google/gemini-3-pro-preview', label: 'Google Gemini 3 Pro Preview' },
                { id: 'google/gemini-2.5-flash', label: 'Google Gemini 2.5 Flash' },
                { id: 'qwen/qwen3-coder', label: 'Qwen 3 Coder' },
                { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
                { id: 'openai/gpt-5.1-codex-mini', label: 'GPT-5.1-Codex-Mini' },
                { id: 'openai/gpt-5.1-codex', label: 'GPT-5.1-Codex' },
                { id: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
                { id: 'x-ai/grok-code-fast-1', label: 'Grok Code Fast 1' },
                { id: 'mistralai/codestral-2508', label: 'Mistral Codestral 2508' },
                { id: 'mistralai/devstral-small', label: 'Mistral Devstral Small' },
                { id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B' },
                { id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
                { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                { id: 'z-ai/glm-4.6', label: 'GLM 4.6' },
                { id: 'x-ai/grok-4-fast', label: 'Grok 4 Fast' },
                { id: 'mistralai/mistral-large-2407', label: 'Mistral Large 2407' },
                { id: 'mistralai/mistral-nemo', label: 'Mistral Nemo' },
                { id: 'moonshotai/kimi-k2-0905', label: 'Kimi K2' },
                { id: 'qwen/qwen3-vl-235b-a22b-instruct', label: 'Qwen 3 VL 235B' },
                { id: 'deepseek/deepseek-v3.1-terminus', label: 'DeepSeek V3.1 Terminus' },
                { id: 'deepseek/deepseek-chat-v3-0324', label: 'DeepSeek Chat V3' },
                { id: 'minimax/minimax-m2', label: 'MiniMax M2' },
            ],
            chatModels: [ // Configure available models for chat
                { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
                { id: 'openai/gpt-4o', label: 'GPT-4o' },
                { id: 'openai/gpt-5.1', label: 'GPT-5.1' },
                { id: 'openai/gpt-5.1-chat', label: 'GPT-5.1 Chat' },
                { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
                { id: 'openai/gpt-5-nano', label: 'GPT-5 Nano' },
                { id: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
                { id: 'google/gemini-2.5-flash', label: 'Google Gemini 2.5 Flash' },
                { id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
                { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                { id: 'z-ai/glm-4.6', label: 'GLM 4.6' },
                { id: 'x-ai/grok-4-fast', label: 'Grok 4 Fast' },
                { id: 'mistralai/mistral-large-2407', label: 'Mistral Large 2407' },
                { id: 'mistralai/mistral-nemo', label: 'Mistral Nemo' },
                { id: 'moonshotai/kimi-k2-0905', label: 'Kimi K2' },
                { id: 'qwen/qwen3-vl-235b-a22b-instruct', label: 'Qwen 3 VL 235B' },
                { id: 'deepseek/deepseek-v3.1-terminus', label: 'DeepSeek V3.1 Terminus' },
                { id: 'deepseek/deepseek-chat-v3-0324', label: 'DeepSeek Chat V3' },
                { id: 'minimax/minimax-m2', label: 'MiniMax M2' },
            ],
            defaultChatSettings: { // Configure default code chat settings
                codeModel: 'google/gemini-3-pro-preview',
                chatModel: 'openai/gpt-5-mini',
                imageModel: 'fal-ai/nano-banana',
                imageSize: ''
            },

            // OpenAI:
            /*
            sendCommandUrl: '/api/openai',
            sendCommandStreamUrl: '/api/openai/stream',
            systemModel: 'gpt-4o-mini',
            codeModels: [
                { id: 'gpt-5.1-2025-11-13', label: 'GPT-5.1' },
                { id: 'gpt-5-mini-2025-08-07', label: 'GPT-5 Mini' },
                { id: 'gpt-4.1-2025-04-14', label: 'GPT-4.1' },
                { id: 'gpt-4.1-mini-2025-04-14', label: 'GPT-4.1 Mini' },
                { id: 'gpt-5.1-codex', label: 'GPT-5.1 Codex' },
                { id: 'gpt-5.1-codex-mini', label: 'GPT-5.1 Codex Mini' },
            ],
            chatModels: [
                { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { id: 'gpt-5-mini-2025-08-07', label: 'GPT-5 Mini' },
                { id: 'gpt-5.1-2025-11-13', label: 'GPT-5.1' },
                { id: 'gpt-5.1-chat-latest', label: 'GPT-5.1 Chat' },
            ],
            defaultChatSettings: {
                codeModel: 'gpt-5-mini-2025-08-07',
                chatModel: 'gpt-5-mini-2025-08-07',
                imageModel: 'fal-ai/nano-banana',
                imageSize: ''
            },
            */

            defaultImageGenerationProvider: 'fal',
            generateMediaUrl_Fal: '/api/assets/request-fal',
            checkRequestStatusUrl_Fal: '/api/assets/status-fal',
            getResultUrl_Fal: '/api/assets/result-fal',
            filePicker: '/files',
            filePickerSize: 'large',

            // 컬러 피커 색상 팔레트
            colors: CMS_COLORS,

            // 블록 추가/변경 시 플러그인 CSS·JS 재적용 (디바운스)
            onChange: debouncedReinit,
            onSnippetAdd: debouncedReinit,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // ContentBuilder 기본 피커는 사용하지 않습니다.
        // 기본 블록은 아래 별도 useEffect에서 로드하여 우측 패널에 표시합니다.

        // Get basePath
        const basePath = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');

        // Initialize runtime BEFORE loading content
        try {
            runtimeRef.current = new ContentBuilderRuntime({
                // 플러그인 전체 재초기화(reinitialize) 완료 후 ContentBuilder 편집 핸들러 재연결
                // — 초기 로드 시 캐시 없는 플러그인들이 비동기로 로드되므로
                //   setTimeout 기반 applyBehavior()보다 이 콜백이 훨씬 신뢰성 높음
                onReInit: () => {
                    builderRef.current?.applyBehavior();
                },
                // Registers available plugins (not yet loaded).
                // Scripts and styles are fetched only when the plugin is actually used in content.
                plugins: {
                    'logo-loop': {
                        url: basePath + '/assets/plugins/logo-loop/index.js',
                        css: basePath + '/assets/plugins/logo-loop/style.css'
                    },
                    'click-counter': {
                        url: basePath + '/assets/plugins/click-counter/index.js',
                        css: basePath + '/assets/plugins/click-counter/style.css'
                    },
                    'card-list': {
                        url: basePath + '/assets/plugins/card-list/index.js',
                        css: basePath + '/assets/plugins/card-list/style.css'
                    },
                    'accordion': {
                        url: basePath + '/assets/plugins/accordion/index.js',
                        css: basePath + '/assets/plugins/accordion/style.css'
                    },
                    'hero-animation': {
                        url: basePath + '/assets/plugins/hero-animation/index.js',
                        css: basePath + '/assets/plugins/hero-animation/style.css'
                    },
                    'animated-stats': {
                        url: basePath + '/assets/plugins/animated-stats/index.js',
                        css: basePath + '/assets/plugins/animated-stats/style.css'
                    },
                    'timeline': {
                        url: basePath + '/assets/plugins/timeline/index.js',
                        css: basePath + '/assets/plugins/timeline/style.css'
                    },
                    'before-after-slider': {
                        url: basePath + '/assets/plugins/before-after-slider/index.js',
                        css: basePath + '/assets/plugins/before-after-slider/style.css'
                    },
                    'more-info': {
                        url: basePath + '/assets/plugins/more-info/index.js',
                        css: basePath + '/assets/plugins/more-info/style.css'
                    },
                    'social-share': {
                        url: basePath + '/assets/plugins/social-share/index.js',
                        css: basePath + '/assets/plugins/social-share/style.css'
                    },
                    'pendulum': {
                        url: basePath + '/assets/plugins/pendulum/index.js',
                        css: basePath + '/assets/plugins/pendulum/style.css'
                    },
                    'browser-mockup': {
                        url: basePath + '/assets/plugins/browser-mockup/index.js',
                        css: basePath + '/assets/plugins/browser-mockup/style.css'
                    },
                    'hero-background': {
                        url: basePath + '/assets/plugins/hero-background/index.js',
                        css: basePath + '/assets/plugins/hero-background/style.css'
                    },
                    'cta-buttons': {
                        url: basePath + '/assets/plugins/cta-buttons/index.js',
                        css: basePath + '/assets/plugins/cta-buttons/style.css'
                    },

                    'media-slider': {
                        url: basePath + '/assets/plugins/media-slider/index.js',
                        css: basePath + '/assets/plugins/media-slider/style.css'
                    },
                    'media-grid': {
                        url: basePath + '/assets/plugins/media-grid/index.js',
                        css: basePath + '/assets/plugins/media-grid/style.css'
                    },
                    'particle-constellation': {
                        url: basePath + '/assets/plugins/particle-constellation/index.js',
                        css: basePath + '/assets/plugins/particle-constellation/style.css'
                    },
                    'vector-force': {
                        url: basePath + '/assets/plugins/vector-force/index.js',
                        css: basePath + '/assets/plugins/vector-force/style.css'
                    },
                    'aurora-glow': {
                        url: basePath + '/assets/plugins/aurora-glow/index.js',
                        css: basePath + '/assets/plugins/aurora-glow/style.css'
                    },
                    'simple-stats': {
                        url: basePath + '/assets/plugins/simple-stats/index.js',
                        css: basePath + '/assets/plugins/simple-stats/style.css'
                    },
                    'faq': {
                        url: basePath + '/assets/plugins/faq/index.js',
                        css: basePath + '/assets/plugins/faq/style.css'
                    },
                    'callout-box': {
                        url: basePath + '/assets/plugins/callout-box/index.js',
                        css: basePath + '/assets/plugins/callout-box/style.css'
                    },
                    'code': {
                        url: basePath + '/assets/plugins/code/index.js',
                        css: basePath + '/assets/plugins/code/style.css'
                    },
                    'video-embed': { // Experimental
                        url: basePath + '/assets/plugins/video-embed/index.js',
                        css: basePath + '/assets/plugins/video-embed/style.css'
                    },
                    'swiper-slider': {
                        url: basePath + '/assets/plugins/swiper-slider/index.js',
                        css: basePath + '/assets/plugins/swiper-slider/style.css'
                    },

                    // ── IBK 금융 모바일 컴포넌트 ──────────────────────────────
                    'product-gallery': {
                        url: basePath + '/assets/plugins/product-gallery/index.js',
                        css: basePath + '/assets/plugins/product-gallery/style.css'
                    },
                    'exchange-board': {
                        url: basePath + '/assets/plugins/exchange-board/index.js',
                        css: basePath + '/assets/plugins/exchange-board/style.css'
                    },
                    'branch-locator': {
                        url: basePath + '/assets/plugins/branch-locator/index.js',
                        css: basePath + '/assets/plugins/branch-locator/style.css'
                    },
                    'promo-banner': {
                        url: basePath + '/assets/plugins/promo-banner/index.js',
                        css: basePath + '/assets/plugins/promo-banner/style.css'
                    },
                    'media-video': {
                        url: basePath + '/assets/plugins/media-video/index.js',
                        css: basePath + '/assets/plugins/media-video/style.css'
                    },
                    'loan-calculator': {
                        url: basePath + '/assets/plugins/loan-calculator/index.js',
                        css: basePath + '/assets/plugins/loan-calculator/style.css'
                    },
                    'auth-center': {
                        url: basePath + '/assets/plugins/auth-center/index.js',
                        css: basePath + '/assets/plugins/auth-center/style.css'
                    },
                    'app-header': {
                        url: basePath + '/assets/plugins/app-header/index.js',
                        css: basePath + '/assets/plugins/app-header/style.css'
                    },
                    'product-menu': {
                        url: basePath + '/assets/plugins/product-menu/index.js',
                        css: basePath + '/assets/plugins/product-menu/style.css'
                    },
                    'site-footer': {
                        url: basePath + '/assets/plugins/site-footer/index.js',
                        css: basePath + '/assets/plugins/site-footer/style.css'
                    },
                }
            });
            // Make runtime available globally for ContentBuilder editor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).builderRuntime = runtimeRef.current;
        } catch (error) {
            console.error('Runtime initialization error:', error);
        }

        // ── RTE 툴바 위치 보정 ────────────────────────────────────────────
        // ContentBuilder JS가 positionToolbar()에서 style.top을 반복 갱신하므로
        // MutationObserver로 툴바 요소의 style 변경을 감지해 top을 강제 오버라이드합니다.
        // 툴바를 네비바 아래, 캔버스 영역(뷰포트 - 우측 패널) 수평 중앙에 배치
        const fixRtePos = (el: HTMLElement) => {
            if (el.style.getPropertyValue('top') === '52px' && el.style.getPropertyPriority('top') === 'important') return;
            el.style.setProperty('top', '52px', 'important');
            el.style.setProperty('left', `calc((100vw - ${PANEL_WIDTH_OPEN}px) / 2)`, 'important');
            el.style.setProperty('transform', 'translateX(-50%)', 'important');
        };
        // 기존 코드와의 호환을 위한 별칭
        const fixRteTop = fixRtePos;

        const rteObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // 새 요소가 DOM에 추가될 때
                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;
                    if (node.classList.contains('is-rte-tool') || node.classList.contains('is-elementrte-tool')) {
                        fixRteTop(node);
                    }
                });
                // 기존 툴바 요소의 style 속성이 변경될 때
                if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
                    const t = mutation.target;
                    if (t.classList.contains('is-rte-tool') || t.classList.contains('is-elementrte-tool')) {
                        fixRteTop(t);
                    }
                }
            });
        });
        rteObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style'],
        });

        // ContentBuilder 초기화 시 이미 생성된 툴바 요소에 즉시 적용
        document.querySelectorAll<HTMLElement>('.is-rte-tool, .is-elementrte-tool').forEach(fixRteTop);
        // 초기화 직후 비동기로도 한 번 더 적용 (ContentBuilder가 rAF 내에서 위치를 재설정할 경우 대비)
        setTimeout(() => {
            document.querySelectorAll<HTMLElement>('.is-rte-tool, .is-elementrte-tool').forEach(fixRteTop);
        }, 300);

        // 에디터 캔버스 내 링크 클릭 시 페이지 이동 차단
        // (컴포넌트 내부 <a href> 가 실제 네비게이션을 일으키는 문제 방지)
        const blockCanvasLinkNavigation = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a[href]');
            if (!anchor) return;
            // 캔버스(.container) 내부 링크만 차단 — 네비바 탭 등 외부 링크는 정상 동작
            const container = document.querySelector('.container');
            if (!container?.contains(anchor)) return;
            const href = anchor.getAttribute('href');
            // '#'이나 'javascript:'는 이미 이동 없으므로 제외
            if (href && href !== '#' && !href.startsWith('javascript')) {
                e.preventDefault();
            }
        };
        // document 레벨 캡처 단계에서 가로채기 — ContentBuilder 이벤트는 그대로 전달
        document.addEventListener('click', blockCanvasLinkNavigation, true);

        // ── 행 활성화 보조 핸들러 (mousedown 캡처 단계) ─────────────────────
        // ContentBuilder의 handleCellClick이 quick-banking 등 플러그인 내부 클릭에서
        // 동작하지 않을 때를 대비한 보완 핸들러입니다.
        //
        // 왜 mousedown + capture인가?
        //  • capture: true → 요소 레벨 핸들러보다 먼저 실행
        //  • mousedown → click 이벤트 체인보다 먼저 실행
        //  • composedPath() → SVG <path>/<use> 같은 내부 요소에서도
        //    .column 조상을 안정적으로 탐색 (closest()는 SVG 경계에서 실패 가능)
        const activateRowOnMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // composedPath()로 이벤트 경로 전체에서 요소 탐색
            // (SVG <path>/<use> 같은 내부 요소에서도 안정적으로 동작)
            const path = e.composedPath() as Element[];

            // ── .cell-add 버튼 클릭 처리 ─────────────────────────────────
            // .cell-add는 .is-col-tool(.is-tool) 안에 있어서 아래 is-tool early-return에
            // 걸려 ContentBuilder의 cellSelected()가 null을 반환하는 문제를 방지합니다.
            // mousedown(캡처) 단계에서 .cell-active를 먼저 설정해두면
            // 이후 click 단계의 ContentBuilder 핸들러가 정상 동작합니다.
            const isCellAdd = path.some(el => el instanceof HTMLElement && el.classList.contains('cell-add'));
            if (isCellAdd) {
                const row = path.find(el => el instanceof HTMLElement && el.classList.contains('row')) as HTMLElement | undefined;
                const container = document.querySelector('.container');
                if (row && container?.contains(row)) {
                    const col = row.querySelector('.column') as HTMLElement | null;
                    if (col) {
                        document.querySelectorAll('.row-active').forEach(r => r.classList.remove('row-active', 'row-outline'));
                        document.querySelectorAll('.cell-active').forEach(c => c.classList.remove('cell-active'));
                        document.querySelectorAll('.builder-active').forEach(b => b.classList.remove('builder-active'));
                        row.classList.add('row-active');
                        col.classList.add('cell-active');
                        row.parentElement?.classList.add('builder-active');
                        document.body.classList.add('content-edit');
                    }
                }
                return; // ContentBuilder의 .cell-add click 핸들러로 위임
            }

            // 그 외 도구 버튼 클릭(이동/삭제/더보기)은 ContentBuilder에 위임
            if (target.closest?.('.is-tool')) return;
            const col = path.find(
                el => el instanceof HTMLElement && el.classList.contains('column')
            ) as HTMLElement | undefined;
            if (!col) return;

            // .container(.is-builder) 내부 클릭만 처리
            const container = document.querySelector('.container');
            if (!container?.contains(col)) return;

            const row = col.parentElement;
            if (!row?.classList.contains('row')) return;

            // handleCellClick이 이미 row-active를 설정했으면 패스
            if (row.classList.contains('row-active')) return;

            // 기존 활성 상태 제거 (ContentBuilder의 clearActiveCell()에 해당)
            document.querySelectorAll('.row-active').forEach(r => r.classList.remove('row-active', 'row-outline'));
            document.querySelectorAll('.cell-active').forEach(c => c.classList.remove('cell-active'));
            document.querySelectorAll('.builder-active').forEach(b => b.classList.remove('builder-active'));

            // 행/열 활성화
            row.classList.add('row-active');
            col.classList.add('cell-active');
            row.parentElement?.classList.add('builder-active');
            document.body.classList.add('content-edit');

            // 다중 열 행인 경우 row-outline 추가 (is-row-tool 등 비열 자식 제외)
            const colCount = Array.from(row.children).filter(
                c => (c as HTMLElement).classList.contains('column')
            ).length;
            if (colCount > 1) row.classList.add('row-outline');
        };
        document.addEventListener('mousedown', activateRowOnMouseDown, true);

        // ── .cell-add 클릭 → 새 행 추가로 리디렉션 ──────────────────────────
        // .cell-add(is-col-tool 내부)의 기본 동작은 같은 열에 옆으로 추가합니다.
        // 금융 컴포넌트 에디터에서는 항상 현재 행 아래에 새 행을 추가해야 하므로
        // 클릭을 캡처 단계에서 가로채 같은 행의 is-rowadd-tool 버튼을 대신 클릭합니다.
        const redirectCellAddToRowAdd = (e: MouseEvent) => {
            const path = e.composedPath() as Element[];
            const isCellAdd = path.some(el => el instanceof HTMLElement && el.classList.contains('cell-add'));
            if (!isCellAdd) return;

            e.stopImmediatePropagation();
            e.preventDefault();

            const row = path.find(el => el instanceof HTMLElement && el.classList.contains('row')) as HTMLElement | undefined;
            if (!row) return;

            const rowAddBtn = row.querySelector('.is-rowadd-tool button') as HTMLElement | null;
            rowAddBtn?.click();
        };
        document.addEventListener('click', redirectCellAddToRowAdd, true);

        // Load content from the server
        fetch('/api/builder/load', {
            method: 'POST',
            body: JSON.stringify({ bank }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(response => {
            if (response.html && builderRef.current) {
                builderRef.current.loadHtml(response.html);
            }
            // 플러그인 CSS·JS 로드 및 mount() 실행 + ContentBuilder 핸들러 재연결
            setTimeout(async () => {
                await runtimeRef.current?.reinitialize();
                builderRef.current?.applyBehavior();
                setContainerOpacity(1);
                // 초기 블록 목록 파싱
                const html = builderRef.current?.html() ?? '';
                setCanvasBlocks(parseBuilderBlocks(html));
            }, 300);
        })
        .catch(error => {
            console.error('Load error:', error);
            setContainerOpacity(1);
        });

        // Cleanup
        return () => {
            rteObserver.disconnect();
            document.removeEventListener('click', blockCanvasLinkNavigation, true);
            document.removeEventListener('click', redirectCellAddToRowAdd, true);
            document.removeEventListener('mousedown', activateRowOnMouseDown, true);
            if (reinitTimer) clearTimeout(reinitTimer);
            builderRef.current?.destroy();
            builderRef.current = null;
            runtimeRef.current?.destroy();
            runtimeRef.current = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).builderRuntime;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).builderReinit;
        };
    }, []);

    // Listen for file selection from the file picker (/files)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            switch (event.data.type) {
                case "ASSET_SELECTED":
                    builderRef.current?.selectAsset(event.data.url);
                    window.focus();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    // ── 탭 localStorage 영속화 ───────────────────────────────────────────
    useEffect(() => {
        localStorage.setItem('cms-default-tabs', JSON.stringify(defaultTabs));
    }, [defaultTabs]);

    useEffect(() => {
        localStorage.setItem('cms-custom-tabs', JSON.stringify(customTabs));
    }, [customTabs]);

    // ── content-plugins 로드 (웹/모바일/반응형 3파일) ─────────────────────
    // ContentBuilder 기본 피커 대신 우측 패널 "기본 블록" 탭에 표시합니다.
    useEffect(() => {
        const sources = [
            { src: '/assets/minimalist-blocks/content-plugins.js',            key: 'data_basic' },
            { src: '/assets/minimalist-blocks/content-plugins-mobile.js',     key: 'data_basic_mobile' },
            { src: '/assets/minimalist-blocks/content-plugins-responsive.js', key: 'data_basic_responsive' },
        ];
        const scripts: HTMLScriptElement[] = [];
        let loaded = 0;

        const mergeAll = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = window as any;
            const raw: BasicBlock[] = [
                ...(w.data_basic?.snippets ?? []),
                ...(w.data_basic_mobile?.snippets ?? []),
                ...(w.data_basic_responsive?.snippets ?? []),
            ];
            // 상대경로 → 절대경로 변환 (캔버스에서 /edit 기준으로 해석되는 문제 방지)
            const fixed = raw.map((s: BasicBlock) => ({
                ...s,
                html: s.html
                    .replace(/src="assets\//g, 'src="/assets/')
                    .replace(/url\(&quot;assets\//g, 'url(&quot;/assets/')
                    .replace(/url\('assets\//g, "url('/assets/")
                    .replace(/url\(assets\//g, 'url(/assets/'),
            }));
            setBasicBlocks(fixed);
        };

        sources.forEach(({ src }) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = s.onerror = () => { loaded++; if (loaded >= sources.length) mergeAll(); };
            document.head.appendChild(s);
            scripts.push(s);
        });

        return () => {
            scripts.forEach(s => { try { document.head.removeChild(s); } catch { /* 이미 제거됨 */ } });
        };
    }, []);

    // ── 컴포넌트 패널 → 캔버스 삽입 ──────────────────────────────────────
    /**
     * 패널에서 선택한 컴포넌트 HTML을 캔버스의 targetIdx 위치에 삽입합니다.
     * insertIdx가 없으면 끝에 추가합니다.
     * 모든 삽입은 loadHtml()로 통일합니다.
     * (addSnippet은 내부 스니펫 레지스트리를 참조해 의도치 않은 컴포넌트를 함께 삽입하는 부작용이 있음)
     */
    const handleInsertComponent = useCallback((html: string, insertIdx?: number) => {
        const builder = builderRef.current;
        if (!builder) return;

        // canvasBlocksRef.current 대신 builder.html()로 현재 DOM 상태를 직접 읽음
        // — ContentBuilder 자체 삭제/이동 후 React state가 동기화되지 않은 경우에도
        //   항상 실제 DOM 기준의 최신 블록 목록을 사용합니다.
        const liveBlocks = parseBuilderBlocks(builder.html() ?? '');
        const wrappedHtml = `<div class="row"><div class="column">\n${html}\n</div></div>`;
        const blockHtmls = liveBlocks.map(b => b.outerHtml);

        // insertIdx가 유효하면 해당 위치에, 아니면 끝에 추가
        // addSnippet 대신 loadHtml로 통일 — addSnippet은 내부 스니펫 레지스트리를
        // 참조해 의도치 않은 컴포넌트를 함께 삽입하는 부작용이 있음
        const targetIdx = (insertIdx !== undefined && insertIdx >= 0)
            ? Math.min(insertIdx, blockHtmls.length)
            : blockHtmls.length;

        blockHtmls.splice(targetIdx, 0, wrappedHtml);
        builder.loadHtml(blockHtmls.join('\n'));

        // 플러그인 재초기화 + ContentBuilder 편집 핸들러 재연결 + 블록 목록 갱신
        setTimeout(async () => {
            await runtimeRef.current?.reinitialize();
            builderRef.current?.applyBehavior();
            const newHtml = builderRef.current?.html() ?? '';
            setCanvasBlocks(parseBuilderBlocks(newHtml));
        }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 순서 탭 블록 클릭 → 캔버스 활성화 ──────────────────────────────
    /**
     * 순서 패널에서 블록을 클릭하면 캔버스의 해당 row를 활성화합니다.
     * ContentBuilder의 handleCellClick은 column 클릭 이벤트로 동작하므로
     * 해당 row의 .column 요소를 프로그래매틱하게 클릭합니다.
     */
    const handleActivate = useCallback((idx: number) => {
        const container = document.querySelector('.container');
        if (!container) return;

        const rows = Array.from(container.children).filter(
            c => (c as HTMLElement).classList.contains('row')
        ) as HTMLElement[];

        const row = rows[idx];
        if (!row) return;

        const col = row.querySelector('.column') as HTMLElement | null;
        col?.click();
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    // ── 블록 삭제 ────────────────────────────────────────────────────────
    /**
     * 순서 패널의 삭제 버튼으로 특정 인덱스의 블록을 제거합니다.
     */
    const handleDelete = useCallback((idx: number) => {
        const builder = builderRef.current;
        if (!builder) return;

        const liveBlocks = parseBuilderBlocks(builder.html() ?? '');
        const next = liveBlocks.filter((_, i) => i !== idx);
        const newHtml = next.map(b => b.outerHtml).join('\n');
        builder.loadHtml(newHtml);

        setTimeout(async () => {
            await runtimeRef.current?.reinitialize();
            builderRef.current?.applyBehavior();
            const updatedHtml = builderRef.current?.html() ?? '';
            setCanvasBlocks(parseBuilderBlocks(updatedHtml));
        }, 300);
    }, []);

    // ── 전체 블록 삭제 ──────────────────────────────────────────────────
    const handleDeleteAllBlocks = useCallback(() => {
        const builder = builderRef.current;
        if (!builder) return;
        builder.loadHtml('');
        setCanvasBlocks([]);
    }, []);

    // ── 블록 순서 변경 ──────────────────────────────────────────────────
    /**
     * 순서 패널의 ▲▼ 버튼으로 블록을 이동합니다.
     * canvasBlocksRef 대신 builder.html()로 항상 최신 DOM 상태를 읽습니다.
     */
    const handleMoveBlock = useCallback((from: number, to: number) => {
        const builder = builderRef.current;
        if (!builder) return;

        const liveBlocks = parseBuilderBlocks(builder.html() ?? '');
        if (from < 0 || from >= liveBlocks.length || to < 0 || to > liveBlocks.length) return;
        if (from === to || from === to - 1) return; // 위치 변동 없음

        // "to"는 원본 배열 기준 "이 인덱스 앞에 삽입" 의미
        // from 제거 후 배열이 짧아지므로 from < to일 때 to를 1 감소
        const next = liveBlocks.filter((_, i) => i !== from);
        const insertAt = from < to ? to - 1 : to;
        next.splice(insertAt, 0, liveBlocks[from]);
        builder.loadHtml(next.map(b => b.outerHtml).join('\n'));

        // 플러그인 재초기화 + ContentBuilder 편집 핸들러 재연결 + 블록 목록 갱신
        setTimeout(async () => {
            await runtimeRef.current?.reinitialize();
            builderRef.current?.applyBehavior();
            const updatedHtml = builderRef.current?.html() ?? '';
            setCanvasBlocks(parseBuilderBlocks(updatedHtml));
        }, 300);
    }, []);

    // ── 오버레이 드롭 핸들러 ──────────────────────────────────────────────
    // 오버레이가 ContentBuilder DOM 위에 직접 렌더링되므로
    // ContentBuilder 내부의 stopPropagation과 무관하게 이벤트를 수신합니다.

    function handleOverlayDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDropOver(true);

        // ── 마우스 Y 위치로 삽입 인덱스 계산 ──────────────────────────
        const container = document.querySelector('.container') as HTMLElement | null;
        if (!container) { dropInsertIdxRef.current = -1; setDropLineY(null); return; }

        // ':scope > .row'로 직계 자식 .row만 선택 (ContentBuilder 내부 UI 요소 제외)
        // rows가 없으면 container 직계 자식 전체를 폴백으로 사용
        let rows = Array.from(container.querySelectorAll<HTMLElement>(':scope > .row'));
        if (rows.length === 0) {
            rows = Array.from(container.children).filter(
                c => !(c as HTMLElement).classList.contains('is-tool')
            ) as HTMLElement[];
        }

        const mouseY = e.clientY;
        let insertIdx = rows.length; // 기본값: 끝

        for (let i = 0; i < rows.length; i++) {
            const rect = rows[i].getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (mouseY < midY) {
                insertIdx = i;
                break;
            }
        }

        dropInsertIdxRef.current = insertIdx;

        // 삽입 선 Y 위치 계산 (viewport 기준)
        if (rows.length === 0) {
            setDropLineY(null);
        } else if (insertIdx === 0) {
            setDropLineY(rows[0].getBoundingClientRect().top);
        } else if (insertIdx >= rows.length) {
            const lastRect = rows[rows.length - 1].getBoundingClientRect();
            setDropLineY(lastRect.bottom);
        } else {
            const prevBottom = rows[insertIdx - 1].getBoundingClientRect().bottom;
            const nextTop    = rows[insertIdx].getBoundingClientRect().top;
            setDropLineY((prevBottom + nextTop) / 2);
        }
    }

    function handleOverlayDragLeave(e: React.DragEvent) {
        // 오버레이 자식 요소(메시지 배지)로 이동할 때 false-positive 방지
        if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
        setIsDropOver(false);
        setDropLineY(null);
    }

    function handleOverlayDrop(e: React.DragEvent) {
        e.preventDefault();
        const insertIdx = dropInsertIdxRef.current;
        setIsDropOver(false);
        setDropLineY(null);
        isDraggingRef.current = false;
        setIsDraggingComponent(false);

        const html = e.dataTransfer.getData('text/plain');
        if (html) {
            // 오버레이를 먼저 unmount한 뒤 삽입
            setTimeout(() => handleInsertComponent(html, insertIdx >= 0 ? insertIdx : undefined), 0);
        }
    }

    // ── 탭 추가 ──────────────────────────────────────────────────────────
    function handleAddTab() {
        const label = newTabName.trim();
        if (!label) return;
        const id = `custom-${Date.now()}`;
        const selectedViewMode = newTabViewMode;

        // 새 캔버스 기본 콘텐츠: 상단 네비게이션(app-header) 컴포넌트
        const headerComp = FINANCE_COMPONENTS.find(c => c.id === 'app-header');
        const defaultHtml = headerComp
            ? `<div class="row"><div class="column">\n${headerComp.html}\n</div></div>`
            : '';

        // 탭 목록 저장 후 기본 콘텐츠를 서버에 먼저 저장 → 이동
        setCustomTabs(prev => [...prev, { id, label, viewMode: selectedViewMode }]);
        setShowAddTab(false);
        setNewTabName('');
        setNewTabViewMode('mobile');

        fetch('/api/builder/save', {
            method: 'POST',
            body: JSON.stringify({ html: defaultHtml, bank: id }),
            headers: { 'Content-Type': 'application/json' },
        }).finally(() => {
            window.location.href = `/edit?bank=${id}`;
        });
    }

    // ── 캔버스(탭) 삭제 ──────────────────────────────────────────────────
    // 기본 탭 / 커스텀 탭 모두 삭제 가능 (최소 1개 탭은 유지)
    // 삭제 시 탭 목록에서 제거 후 남은 첫 번째 탭으로 이동
    async function handleDeleteCanvas() {
        const currentLabel = allTabs.find(t => t.id === bank)?.label ?? bank;
        if (!confirm(`'${currentLabel}' 탭을 삭제하시겠습니까?\n저장된 내용도 함께 삭제됩니다.`)) return;

        builderRef.current?.loadHtml('');
        setCanvasBlocks([]);
        await fetch('/api/builder/save', {
            method: 'POST',
            body: JSON.stringify({ html: '', bank }),
            headers: { 'Content-Type': 'application/json' },
        });

        const isDefault = defaultTabs.some(t => t.id === bank);
        const nextDefaultTabs = isDefault ? defaultTabs.filter(t => t.id !== bank) : defaultTabs;
        const nextCustomTabs = isDefault ? customTabs : customTabs.filter(t => t.id !== bank);

        // useEffect 대기 없이 즉시 localStorage에 반영 (페이지 이동 전)
        localStorage.setItem('cms-default-tabs', JSON.stringify(nextDefaultTabs));
        localStorage.setItem('cms-custom-tabs', JSON.stringify(nextCustomTabs));

        setDefaultTabs(nextDefaultTabs);
        setCustomTabs(nextCustomTabs);

        // 남은 탭 중 첫 번째로 이동
        const remaining = [...nextDefaultTabs, ...nextCustomTabs];
        const nextId = remaining[0]?.id ?? '';
        window.location.href = `/edit?bank=${nextId}`;
    }

    // ── 저장 / 미리보기 / HTML 보기 ──────────────────────────────────────
    const save = async () => {
        if (!builderRef.current) return;
        const builder = builderRef.current;

        const html = builder.html();
        const response = await fetch('/api/builder/save', {
            method: 'POST',
            body: JSON.stringify({ html, bank }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (result.error) {
            console.error('Save error:', result.error);
        } else {
            console.log('Content saved successfully.');
        }
    };

    async function handleSave() {
        await save();
        alert('저장이 완료되었습니다.');
    }

    function handlePreview() {
        save();
        window.open(`/view?bank=${bank}`, '_blank');
    }

    function handleViewHtml() {
        builderRef.current?.viewHtml();
    }

    return (
        <>
        {/* ── 상단 네비바 ── */}
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0,
            height: '52px', zIndex: 100,
            background: '#ffffff', borderBottom: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: '4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            {/* 로고 */}
            <span style={{
                fontWeight: 700, fontSize: '15px', color: '#0046A4',
                marginRight: '16px', whiteSpace: 'nowrap', letterSpacing: '-0.3px',
            }}>
                Springware CMS
            </span>

            {/* 은행별 탭 */}
            <div style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto', alignItems: 'center' }}>
                {[...defaultTabs, ...customTabs].map(b => (
                    <a
                        key={b.id}
                        href={`/edit?bank=${b.id}`}
                        style={{
                            padding: '5px 14px',
                            borderRadius: '6px',
                            background: bank === b.id ? '#0046A4' : 'transparent',
                            color: bank === b.id ? '#ffffff' : '#374151',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: bank === b.id ? 600 : 400,
                            whiteSpace: 'nowrap',
                            transition: 'background 0.15s',
                        }}
                    >
                        {b.label}
                    </a>
                ))}

                {/* 새 페이지 추가 버튼 */}
                <button
                    onClick={() => setShowAddTab(true)}
                    title="새 페이지 추가"
                    style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '1px solid #e5e7eb', background: 'transparent',
                        color: '#6b7280', fontSize: '18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: '4px', lineHeight: 1, flexShrink: 0,
                    }}
                >+</button>
            </div>

            {/* 현재 뷰 모드 뱃지 (읽기 전용 — 생성 시 결정, 변경 불가) */}
            <span
                title={`이 페이지는 ${VIEW_MODE_CONFIG[viewMode].label} 레이아웃입니다`}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '12px', marginLeft: '8px',
                    background: '#f0f4ff', border: '1px solid #c7d8f4',
                    color: '#0046A4', fontSize: '12px', fontWeight: 600,
                    whiteSpace: 'nowrap', userSelect: 'none',
                }}
            >
                <span style={{ fontSize: '13px' }}>{VIEW_MODE_CONFIG[viewMode].icon}</span>
                {VIEW_MODE_CONFIG[viewMode].label}
            </span>

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                <button onClick={handleViewHtml} style={btnStyle}>HTML</button>
                <button onClick={handlePreview} style={btnStyle}>미리보기</button>
                <button
                    onClick={handleDeleteCanvas}
                    disabled={defaultTabs.length + customTabs.length <= 1}
                    style={{
                        ...btnStyle,
                        color: defaultTabs.length + customTabs.length <= 1 ? '#d1d5db' : '#dc2626',
                        borderColor: defaultTabs.length + customTabs.length <= 1 ? '#e5e7eb' : '#fca5a5',
                        cursor: defaultTabs.length + customTabs.length <= 1 ? 'not-allowed' : 'pointer',
                    }}
                >삭제</button>
                <button onClick={handleSave} style={{ ...btnStyle, background: '#0046A4', color: '#fff', borderColor: '#0046A4' }}>저장</button>
            </div>
        </nav>

        {/* ── ContentBuilder 캔버스 + 드롭 오버레이 ── */}
        <div
            style={{
                marginTop: '52px',       // 네비바 높이
                paddingTop: '56px',      // RTE 툴바 높이(~44px) + 여백 12px — container margin 대신 여기에 설정
                marginRight: `${PANEL_WIDTH_OPEN}px`,
                minHeight: 'calc(100vh - 52px)',
                position: 'relative',
                background: viewMode === 'responsive' ? '#ffffff' : '#dde1e7',  // 모바일 기기 배경색
                overflowX: 'visible',
            }}
        >
            {/*
              드래그 중 캔버스 위에 덮는 실제 드롭 타겟 오버레이.
              ContentBuilder 내부 DOM이 dragover에 stopPropagation을 호출해도
              오버레이는 ContentBuilder 위에 직접 렌더링되므로 이벤트를 수신합니다.
            */}
            {isDraggingComponent && (
                <div
                    onDragOver={handleOverlayDragOver}
                    onDragLeave={handleOverlayDragLeave}
                    onDrop={handleOverlayDrop}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 85,
                        border: isDropOver ? '2px dashed #0046A4' : '2px dashed #93c5fd',
                        background: isDropOver ? 'rgba(0,70,164,0.06)' : 'rgba(0,70,164,0.02)',
                        transition: 'border-color 0.15s, background 0.15s',
                        borderRadius: '4px',
                        cursor: 'copy',
                    }}
                >
                    {/* 드롭 안내 배지 */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: isDropOver ? '#0046A4' : 'rgba(0,70,164,0.75)',
                        color: '#ffffff',
                        padding: '10px 24px',
                        borderRadius: '24px',
                        fontSize: '13px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 16px rgba(0,70,164,0.25)',
                        pointerEvents: 'none',
                        transition: 'background 0.15s',
                    }}>
                        {isDropOver ? '놓으면 캔버스에 추가됩니다' : '이곳에 놓아 추가하세요'}
                    </div>

                    {/* 삽입 위치 표시 선 (드래그오버 시) — 모바일 컨테이너 너비에 맞춤 */}
                    {dropLineY !== null && (
                        <div style={{
                            position: 'fixed',
                            top: dropLineY,
                            left: 0,
                            right: `${PANEL_WIDTH_OPEN}px`,
                            display: 'flex',
                            justifyContent: 'center',
                            zIndex: 86,
                            pointerEvents: 'none',
                        }}>
                            <div style={{
                                width: VIEW_MODE_CONFIG[viewMode].maxWidth,
                                maxWidth: '100%',
                                height: '3px',
                                background: '#0046A4',
                                borderRadius: '2px',
                                boxShadow: '0 0 6px rgba(0,70,164,0.5)',
                            }} />
                        </div>
                    )}
                </div>
            )}

            {/* 모바일 앱 캔버스
              * 390px (iPhone 표준) 크기로 모바일 앱 화면을 시뮬레이션
              * 행도구는 컨테이너 오른쪽 바깥(right: -40px)에 표시 —
              *   좁은 컨테이너가 가운데 정렬되므로 패널과 충분한 간격 확보
              * padding-bottom: 240px — 마지막 컴포넌트 아래 드롭 공간
              */}
            <div
                className="container"
                style={{
                    maxWidth: VIEW_MODE_CONFIG[viewMode].maxWidth,
                    width: '100%',
                    margin: '0 auto',  // 상단 간격은 wrapper paddingTop으로 처리
                    padding: '0 0 240px 0',
                    background: '#ffffff',
                    minHeight: '700px',
                    boxShadow: viewMode === 'responsive' ? 'none' : '0 8px 48px rgba(0,0,0,0.22)',
                    transition: 'opacity 0.6s ease, max-width 0.3s ease',
                    opacity: containerOpacity,
                }}
            />
        </div>

        {/* ── 우측 컴포넌트 패널 ── */}
        <ComponentPanel
            onInsert={handleInsertComponent}
            blocks={canvasBlocks}
            onMoveBlock={handleMoveBlock}
            onDelete={handleDelete}
            onDeleteAll={handleDeleteAllBlocks}
            onActivate={handleActivate}
            viewMode={viewMode}
            basicBlocks={basicBlocks}
            onDragStart={() => {
                // ref는 즉시 갱신 (dragover 핸들러에서 동기 참조)
                isDraggingRef.current = true;
                // state는 리렌더링 트리거 (오버레이 표시)
                setIsDraggingComponent(true);
            }}
            onDragEnd={() => {
                isDraggingRef.current = false;
                setIsDraggingComponent(false);
                setIsDropOver(false);
                setDropLineY(null);
            }}
        />

        {/* ── 새 페이지 추가 모달 ── */}
        {showAddTab && (
            <div
                onClick={() => { setShowAddTab(false); setNewTabName(''); setNewTabViewMode('mobile'); }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#ffffff', borderRadius: '16px',
                        padding: '32px', width: '480px', maxWidth: '90vw',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                    }}
                >
                    <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                        새 페이지 만들기
                    </h3>

                    {/* 페이지 이름 */}
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        페이지 이름
                    </label>
                    <input
                        autoFocus
                        value={newTabName}
                        onChange={e => setNewTabName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && newTabName.trim()) handleAddTab();
                            if (e.key === 'Escape') { setShowAddTab(false); setNewTabName(''); setNewTabViewMode('mobile'); }
                        }}
                        placeholder="예: 메인 페이지"
                        style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />

                    {/* 레이아웃 선택 */}
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', margin: '20px 0 10px' }}>
                        레이아웃 선택
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {(Object.keys(VIEW_MODE_CONFIG) as ViewMode[]).map(mode => {
                            const cfg = VIEW_MODE_CONFIG[mode];
                            const selected = newTabViewMode === mode;
                            const descriptions: Record<ViewMode, string> = {
                                mobile: '390px 고정 너비\n모바일 앱 화면에 최적화',
                                web: '1280px 고정 너비\n데스크톱 웹 페이지용',
                                responsive: '전체 너비 사용\n모든 기기에 대응',
                            };
                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setNewTabViewMode(mode)}
                                    style={{
                                        flex: 1, padding: '16px 12px', borderRadius: '12px',
                                        border: selected ? '2px solid #0046A4' : '2px solid #e5e7eb',
                                        background: selected ? '#f0f4ff' : '#ffffff',
                                        cursor: 'pointer', textAlign: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cfg.icon}</div>
                                    <div style={{
                                        fontSize: '14px', fontWeight: 700,
                                        color: selected ? '#0046A4' : '#374151', marginBottom: '6px',
                                    }}>
                                        {cfg.label}
                                    </div>
                                    <div style={{
                                        fontSize: '11px', color: '#6b7280', lineHeight: 1.4,
                                        whiteSpace: 'pre-line',
                                    }}>
                                        {descriptions[mode]}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '12px 0 0', lineHeight: 1.4 }}>
                        레이아웃은 페이지 생성 후 변경할 수 없습니다.
                    </p>

                    {/* 하단 버튼 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                        <button
                            onClick={() => { setShowAddTab(false); setNewTabName(''); setNewTabViewMode('mobile'); }}
                            style={{ ...btnStyle, padding: '8px 20px' }}
                        >취소</button>
                        <button
                            onClick={handleAddTab}
                            disabled={!newTabName.trim()}
                            style={{
                                ...btnStyle, padding: '8px 20px',
                                background: newTabName.trim() ? '#0046A4' : '#93c5fd',
                                color: '#fff',
                                borderColor: newTabName.trim() ? '#0046A4' : '#93c5fd',
                                cursor: newTabName.trim() ? 'pointer' : 'not-allowed',
                            }}
                        >만들기</button>
                    </div>
                </div>
            </div>
        )}

        </>
    );
}
