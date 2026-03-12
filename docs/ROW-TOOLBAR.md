# 행 도구(Row Toolbar) 동작 원리 & 구현 기록

> 이 문서는 ContentBuilder.js의 **행 도구(row toolbar)**가 에디터 캔버스에서 올바르게 표시되도록
> 해결한 과정을 기록한다. 이후 유사한 문제가 발생하면 이 문서를 먼저 읽을 것.

---

## 1. 행 도구란?

ContentBuilder.js는 캔버스에서 블록(row)을 클릭하면 두 가지 UI를 자동으로 표시한다.

| UI | CSS 클래스 | 위치 | 버튼 |
|---|---|---|---|
| **행 도구 (Row Tool)** | `.is-row-tool` | row **오른쪽 바깥** | 이동(⊕), 더보기(...), 삭제(🗑) |
| **열 도구 (Column Tool)** | `.is-col-tool` | row **위쪽 좌측** | 추가(+), 더보기(...), 삭제(🗑) |

작동 원리:
1. 사용자가 컴포넌트 클릭 → `handleCellClick(col, e)` 실행
2. `.row-active` 클래스가 `.row` 요소에 추가됨
3. CSS `.row-active .is-row-tool { display: flex }` 로 툴바 표시

---

## 2. 기본 CSS 구조 (ContentBuilder 내부)

```css
/* 기본값: 숨김 */
.is-tool { position: absolute; top: 0; left: 0; display: none; z-index: 10001; }

/* 행 도구: row 오른쪽 40px 바깥에 세로 배열 */
.is-tool.is-row-tool { right: -40px; left: auto; flex-direction: column; }

/* row 클릭 시 표시 */
.row-active .is-row-tool { display: flex; }

/* row 클릭 시 초록 테두리 + stacking context 생성 */
.is-builder .row-active:not([data-protected]) { outline: 1px solid #00da89; z-index: 1; }
```

---

## 3. 문제가 있었던 이유 (두 가지)

### 문제 A — 행 도구가 패널에 가려짐 (CSS/레이아웃)

**원인:**
- 행 도구는 `right: -40px` → row 오른쪽 40px 바깥에 위치
- container의 우측 패딩이 `20px`이라 row 오른쪽 끝이 패널보다 20px 안쪽
- 행 도구(40px 돌출)가 패널(264px 고정 우측) 아래로 침범
- 설상가상: `row-active { z-index: 1 }` 이 stacking context를 만들어
  → 패널(`z-index: 90`)이 행 도구(`z-index: 10001` but in z-index:1 context)보다 위에 그려짐

**해결 (`EditClient.tsx`):**
```jsx
// padding-right: 48px — row 우측 끝 + 40px 툴바 = canvas 너비 - 8px (패널 시작보다 8px 안쪽)
<div className="container" style={{ padding: '0 48px 0 20px', ... }} />
```

수학 검증:
```
row 우측 끝     = canvas_width - 48px
행 도구 우측 끝  = canvas_width - 48 + 40 = canvas_width - 8px
패널 시작        = canvas_width (= viewport - 264px)
→ 행 도구가 패널보다 8px 안쪽에 위치 → 겹침 없음 ✓
```

---

### 문제 B — 기존 저장된 컴포넌트에 행 도구가 붙지 않음 (타이밍)

**원인:**
- `loadHtml()` 후 `setTimeout(300ms)` 안에서 `await reinitialize()` → `applyBehavior()` 호출
- 플러그인 JS/CSS가 **캐시 없는 초기 로드** 시 비동기로 느리게 로드됨
- `reinitialize()`가 내부적으로 재진입 방지(`reinitializeInProgress`)를 하면서
  첫 번째 호출이 완료되기 전에 두 번째 300ms 타이머가 겹쳐 돌아 경쟁 조건 발생
- `applyBehavior()`가 플러그인 마운트 완료 전에 실행 → row에 행 도구 미삽입

**해결 (`EditClient.tsx`):**
`ContentBuilderRuntime`의 `onReInit` 콜백 사용.
이 콜백은 **모든 플러그인이 완전히 마운트된 직후** 호출되므로 타이밍 문제 없음.

```ts
runtimeRef.current = new ContentBuilderRuntime({
    // 플러그인 전체 재마운트 완료 후 ContentBuilder 편집 핸들러 재연결
    onReInit: () => {
        builderRef.current?.applyBehavior();
    },
    plugins: { ... }
});
```

---

## 4. `applyBehavior()` 가 하는 일

`builderRef.current.applyBehavior()` 를 호출하면:

1. 캔버스 내 모든 `.row` 요소를 순회
2. 각 `.row`에 `.is-row-tool` HTML 삽입 (이미 있으면 SKIP)
3. 각 `.column`에 `click` 이벤트 리스너 등록 (`handleCellClick`)
4. `handleCellClick` → `row-active`, `cell-active` 클래스 추가 → CSS로 툴바 표시

**주의:** `reinitialize()` (Runtime)가 완전히 끝난 후에 호출해야 한다.
플러그인 DOM이 마운트되기 전에 호출하면 일부 row가 처리 안 될 수 있다.

---

## 5. 겹치는 버튼 제거 (`globals.css`)

그리드 에디터 버튼 숨김 — 금융 컴포넌트는 단일 열 구조라 열 레이아웃 편집 불필요:

```css
.is-builder .is-tool.is-row-tool .row-grideditor {
    display: none !important;
}
```

---

## 6. 현재 최종 구현 상태

| 항목 | 값 | 파일 |
|---|---|---|
| container 우측 패딩 | `48px` | `EditClient.tsx` |
| 행 도구 위치 | ContentBuilder 기본값 유지 (`right: -40px`) | (CSS 오버라이드 없음) |
| 그리드 에디터 버튼 | 숨김 | `globals.css` |
| 플러그인 마운트 후 재연결 | `onReInit` 콜백 | `EditClient.tsx` |

---

## 7. 주의사항 / 흔한 실수

- **절대로 `container`에 `overflow: hidden` 넣지 말 것** → 행 도구가 잘림
- **`reinitialize()` 없이 `applyBehavior()` 호출 금지** → 플러그인 DOM 불완전 상태에서 실행
- **행 도구 위치를 CSS로 바꾸면 위치 계산이 어긋남** → 패딩으로 공간 확보하는 것이 정답
- **`overflow: hidden` 제거 이력**: 8개 플러그인 `style.css`의 루트 `[data-cb-type]` 선택자에서
  `overflow: hidden` 을 제거함 (ContentBuilder 툴바 클리핑 방지)
