# 플러그인 컴포넌트 → 순수 HTML 변환 가이드

완성 예시: `scripts/migrate-app-header-to-html.ts`

---

## 절차

### 1. 플러그인 파일 분석

- `public/assets/plugins/<name>/style.css` — 모든 스타일 확인
- `public/assets/plugins/<name>/index.js` — `mount()` 동적 주입 스타일, DOM 구조, 기본값 상수 확인

### 2. 순수 HTML 작성 (3개 variant)

- `data-cb-type="<name>"` 속성 **제거**
- outer div에 `data-spw-block` 속성 **추가** — `EditClient.tsx`의 `handleInsertComponent`가 이 속성을 감지해 컬럼에 `spw-finance-col` 클래스를 주입하고, `globals.css`가 해당 컬럼의 패딩을 제거해 캔버스 전체 너비를 채운다
- CSS 클래스 스타일 전부 → inline `style=""` 로 이식
- `mount()`에서 동적 주입하던 스타일도 inline에 포함
- 기본 이미지·색상 상수는 HTML에 하드코딩

| variant | 차이점 |
|---------|--------|
| `mobile` | 작은 패딩·폰트·이미지 |
| `web` | 넓은 패딩, `max-width` + `margin:0 auto` |
| `responsive` | `width:100%;box-sizing:border-box` |

슬라이더 포함 컴포넌트(`product-gallery`, `promo-banner`)는 스와이프 JS 제거 → flex/grid 정적 레이아웃으로 재구성.

### 3. 마이그레이션 스크립트 작성

`scripts/migrate-<name>-to-html.ts`

```ts
import 'dotenv/config';
import { getComponentById, updateComponent } from '../src/db/repository/component.repository';
import { closePool } from '../src/db/connection';

const MOBILE_HTML    = `...`;
const WEB_HTML       = `...`;
const RESPONSIVE_HTML = `...`;

const VARIANTS = [
    { id: '<name>-mobile',     html: MOBILE_HTML },
    { id: '<name>-web',        html: WEB_HTML },
    { id: '<name>-responsive', html: RESPONSIVE_HTML },
];

async function main() {
    for (const variant of VARIANTS) {
        const existing = await getComponentById(variant.id);
        if (!existing) {
            console.error(`❌ ${variant.id} — 찾을 수 없음`);
            continue;
        }
        await updateComponent({
            componentId:        variant.id,
            componentType:      existing.COMPONENT_TYPE,
            viewMode:           existing.VIEW_MODE,
            componentThumbnail: existing.COMPONENT_THUMBNAIL ?? undefined,
            data: { ...(existing.DATA ?? {}) as Record<string, unknown>, html: variant.html },
            lastModifierId: 'system',
        });
        console.log(`✅ ${variant.id} 완료`);
    }
    await closePool();
}

main().catch((err) => { console.error('실패:', err); process.exit(1); });
```

**주의**: `componentType`, `viewMode`는 반드시 기존값을 전달해야 한다. 생략하면 `null`로 덮어써진다.

### 4. 실행

```bash
npx tsx scripts/migrate-<name>-to-html.ts
```

### 5. 확인

- 에디터에서 해당 컴포넌트를 패널에서 **새로 드래그** → 더블클릭 인라인 편집 가능 여부
- `/view` 렌더링 정상 여부

> 기존 저장 페이지의 블록은 마이그레이션 대상이 아니다. 해당 블록은 삭제 후 새로 추가해야 한다.
