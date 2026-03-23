# Lint / CI 설정 가이드

> Prettier · ESLint 규칙 추가 · husky + lint-staged · GitHub Actions CI를 순서대로 설치하고 강제하는 방법입니다.
> 각 단계는 독립적으로 진행할 수 있습니다.

---

## 목차

1. [Prettier 설치 및 설정](#1-prettier-설치-및-설정)
2. [ESLint 규칙 추가](#2-eslint-규칙-추가)
3. [husky + lint-staged (커밋 전 자동 검사)](#3-husky--lint-staged-커밋-전-자동-검사)
4. [GitHub Actions CI](#4-github-actions-ci)
5. [커버 범위 요약](#5-커버-범위-요약)

---

## 1. Prettier 설치 및 설정

### 설치

```bash
npm install --save-dev prettier eslint-config-prettier
```

- `prettier`: 포매터 본체
- `eslint-config-prettier`: ESLint와 Prettier 규칙 충돌 비활성화

### `.prettierrc` 생성

프로젝트 루트에 생성합니다. 코딩 컨벤션 기준값으로 설정합니다.

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 4,
  "trailingComma": "all",
  "printWidth": 120,
  "endOfLine": "lf"
}
```

### `.prettierignore` 생성

```
node_modules/
.next/
out/
public/
```

### `eslint.config.mjs` 에 prettier 추가

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier",          // ← 추가: ESLint-Prettier 충돌 규칙 끄기
  ),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
```

### `package.json` scripts 추가

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
    "seed": "npx tsx src/db/seed/run-seed.ts"
  }
}
```

### 기존 코드 일괄 포맷

설치 후 처음 한 번만 실행합니다.

```bash
npm run format
```

---

## 2. ESLint 규칙 추가

코딩 컨벤션에서 Prettier로 커버되지 않는 규칙을 ESLint에 추가합니다.

### `eslint.config.mjs` 규칙 블록 추가

```js
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      // console.log 커밋 금지 (error/warn은 허용)
      "no-console": ["warn", { allow: ["error", "warn"] }],

      // import 순서 강제 (외부 → 내부 절대경로 → 상대경로)
      // 주의: eslint-plugin-import 설치 필요 (아래 참고)
      // "import/order": ["error", { ... }],
    },
  },
];
```

> **`import/order` 규칙을 원한다면** 추가 패키지가 필요합니다.
> ```bash
> npm install --save-dev eslint-plugin-import
> ```
> 설치 후 `rules`의 주석 처리된 `import/order` 줄을 해제합니다.

### 확인

```bash
npm run lint
```

`console.log`가 남아있는 파일에서 경고가 출력됩니다.

---

## 3. husky + lint-staged (커밋 전 자동 검사)

커밋할 때마다 변경된 파일에 한해 Prettier + ESLint를 자동 실행합니다.

### 설치

```bash
npm install --save-dev husky lint-staged
```

### husky 초기화

```bash
npx husky init
```

`.husky/` 폴더와 `pre-commit` 훅 파일이 자동 생성됩니다.

### `.husky/pre-commit` 내용 교체

```sh
npx lint-staged
```

### `package.json` 에 `lint-staged` 설정 추가

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

### 동작 확인

```bash
git add src/app/api/health/route.ts
git commit -m "test: husky 동작 확인"
```

커밋 전 Prettier 포맷 + ESLint 검사가 자동으로 실행됩니다. 오류가 있으면 커밋이 중단됩니다.

---

## 4. GitHub Actions CI

PR이 열리거나 main 브랜치에 푸시될 때 자동으로 타입 검사 + lint 실행합니다.

### `.github/workflows/ci.yml` 생성

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - name: 코드 체크아웃
        uses: actions/checkout@v4

      - name: Node.js 설정
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: 의존성 설치
        run: npm ci

      - name: TypeScript 타입 검사
        run: npx tsc --noEmit

      - name: ESLint 검사
        run: npm run lint

      - name: Prettier 포맷 검사
        run: npm run format:check
```

### 동작 흐름

```
PR 오픈 / main 푸시
    ↓
tsc --noEmit       (타입 에러 검사)
    ↓
eslint             (no-console 등 규칙 위반 검사)
    ↓
prettier --check   (포맷 불일치 검사)
    ↓
❌ 실패 시 → PR 머지 차단
✅ 통과 시 → 머지 가능
```

### PR 머지 보호 설정 (GitHub 웹에서)

1. `Settings` → `Branches` → `main` 브랜치 규칙 편집
2. **Require status checks to pass before merging** 활성화
3. `lint-and-typecheck` 체크 항목 추가

---

## 5. 커버 범위 요약

| 컨벤션 항목 | Prettier | ESLint | CI |
|---|:---:|:---:|:---:|
| single quote | ✅ | | ✅ |
| 4 spaces 들여쓰기 | ✅ | | ✅ |
| 세미콜론 | ✅ | | ✅ |
| 트레일링 콤마 | ✅ | | ✅ |
| 줄 길이 120자 | ✅ | | ✅ |
| `console.log` 금지 | | ✅ | ✅ |
| import 순서 | | ✅ (plugin) | ✅ |
| TypeScript 타입 에러 | | | ✅ (tsc) |
| `catch (error)` 변수명 | | △ (복잡) | — |
| 파일 헤더 주석 | | — | — |

> △ 자동화가 까다로운 항목은 코드 리뷰로 보완합니다.
