# Lint / CI 설정 가이드

> 팀 전체에 코딩 컨벤션을 자동으로 강제하기 위한 도구 설정 가이드입니다.
> **반드시 아래 순서대로 진행하세요.** 각 단계가 다음 단계의 기반이 됩니다.

```
1단계: Prettier       → 포맷 규칙 정의
2단계: husky + lint-staged → 커밋 전 로컬 자동 검사
3단계: GitHub Actions CI   → PR 머지 전 서버 검증 (최종 차단)
```

---

## 목차

1. [Prettier 도입](#1-prettier-도입)
2. [ESLint 규칙 추가](#2-eslint-규칙-추가)
3. [husky + lint-staged 도입](#3-husky--lint-staged-도입)
4. [GitHub Actions CI 설정](#4-github-actions-ci-설정)
5. [커버 범위 요약](#5-커버-범위-요약)

---

## 1. Prettier 도입

### 1-1. 패키지 설치

```bash
npm install --save-dev prettier eslint-config-prettier
```

| 패키지 | 역할 |
|---|---|
| `prettier` | 코드 포매터 본체 |
| `eslint-config-prettier` | ESLint와 Prettier 규칙 충돌 비활성화 |

### 1-2. `.prettierrc` 생성

프로젝트 루트(`package.json`과 같은 위치)에 생성합니다.

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

> 각 옵션이 코딩 컨벤션의 어느 규칙에 대응하는지:
> - `singleQuote: true` → single quote 통일
> - `tabWidth: 4` → 들여쓰기 4 spaces
> - `semi: true` → 세미콜론 필수
> - `trailingComma: "all"` → 트레일링 콤마
> - `printWidth: 120` → 최대 줄 길이 120자
> - `endOfLine: "lf"` → 줄 끝 통일 (Windows CRLF 방지)

### 1-3. `.prettierignore` 생성

프로젝트 루트에 생성합니다. Prettier가 건드리지 않을 폴더를 지정합니다.

```
node_modules/
.next/
out/
public/
data/
migrations/
scripts/
```

### 1-4. `eslint.config.mjs` 수정

`"prettier"`를 extends 목록 **마지막**에 추가합니다. (순서 중요 — 마지막에 있어야 Prettier와 충돌하는 ESLint 규칙을 덮어씁니다.)

**변경 전:**
```js
...compat.extends("next/core-web-vitals", "next/typescript"),
```

**변경 후:**
```js
...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
```

### 1-5. `package.json` scripts 추가

기존 `scripts`에 아래 두 줄을 추가합니다.

```json
"format": "prettier --write \"src/**/*.{ts,tsx}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx}\""
```

추가 후 전체 scripts:

```json
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
```

### 1-6. 기존 코드 일괄 포맷 (최초 1회)

설치 직후 **한 번만** 실행합니다. 변경 파일이 많이 생기므로 별도 커밋으로 분리합니다.

```bash
npm run format
git add -A
git commit -m "chore: Prettier 일괄 포맷 적용"
```

### 1-7. 동작 확인

```bash
# 포맷 검사 (수정 없이 확인만)
npm run format:check

# 포맷 자동 수정
npm run format
```

`format:check` 실행 시 아무 출력 없이 종료되면 모든 파일이 컨벤션에 맞는 것입니다.

---

## 2. ESLint 규칙 추가

Prettier가 커버하지 못하는 규칙(console.log 금지 등)을 ESLint에 추가합니다.

### 2-1. `eslint.config.mjs`에 rules 블록 추가

1-4에서 수정한 파일에 이어서 `rules` 블록을 추가합니다.

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
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // console.log 커밋 금지 (error/warn은 허용)
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },
];

export default eslintConfig;
```

### 2-2. 동작 확인

```bash
npm run lint
```

`console.log`가 남아있는 파일에서 경고가 출력됩니다.
경고를 모두 제거하거나, CI에서 `--max-warnings 0` 옵션을 쓰면 경고도 에러로 처리할 수 있습니다.

---

## 3. husky + lint-staged 도입

커밋할 때마다 **변경된 파일에 한해** Prettier + ESLint를 자동 실행합니다.
포맷이 맞지 않거나 ESLint 오류가 있으면 커밋이 자동으로 중단됩니다.

> **선행 조건**: 1단계(Prettier)가 완료된 상태여야 합니다.

### 3-1. 패키지 설치

```bash
npm install --save-dev husky lint-staged
```

### 3-2. husky 초기화

```bash
npx husky init
```

실행하면 프로젝트 루트에 `.husky/` 폴더와 `.husky/pre-commit` 파일이 자동 생성됩니다.
`package.json`의 `scripts`에 `"prepare": "husky"`가 자동으로 추가됩니다.

> `prepare` 스크립트는 팀원이 `npm install` 할 때 자동으로 실행되어 husky 훅을 등록합니다.
> 즉, 팀원은 별도 설정 없이 `npm install`만 하면 됩니다.

### 3-3. `.husky/pre-commit` 파일 수정

`npx husky init`이 생성한 기본 내용을 아래로 교체합니다.

```sh
npx lint-staged
```

### 3-4. `package.json`에 `lint-staged` 설정 추가

`scripts`와 같은 레벨에 추가합니다.

```json
{
  "scripts": { ... },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

> `prettier --write` → 포맷 자동 수정
> `eslint --fix` → 자동으로 고칠 수 있는 ESLint 위반 자동 수정
> 두 작업 모두 실패하면 커밋이 중단됩니다.

### 3-5. 동작 확인

파일을 하나 수정 후 커밋해서 훅이 실행되는지 확인합니다.

```bash
# 아무 파일이나 수정 후 스테이징
git add src/app/api/health/route.ts

# 커밋 시 lint-staged 자동 실행됨
git commit -m "test: husky 동작 확인"
```

커밋 메시지 입력 전에 아래와 같은 출력이 나타나면 정상입니다.

```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

### 3-6. 팀원 적용 방법

팀원은 별도 설정 없이 아래 명령만 실행하면 됩니다.

```bash
git pull
npm install   # prepare 스크립트가 자동으로 husky 훅 등록
```

이후 커밋할 때마다 자동으로 검사가 실행됩니다.

---

## 4. GitHub Actions CI 설정

PR이 열리거나 `main` 브랜치에 푸시될 때 서버에서 자동으로 검증합니다.
검증 실패 시 PR 머지가 차단됩니다.

> **선행 조건**: 1단계(Prettier) + 2단계(ESLint 규칙)가 완료된 상태여야 합니다.

### 4-1. 워크플로우 파일 생성

`.github/workflows/ci.yml` 파일을 생성합니다. (`.github/` 폴더가 없으면 함께 생성)

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

### 4-2. 동작 흐름

```
PR 오픈 또는 main 브랜치 푸시
         ↓
  의존성 설치 (npm ci)
         ↓
  tsc --noEmit      ← 타입 에러 검사
         ↓
  eslint            ← no-console 등 규칙 위반 검사
         ↓
  prettier --check  ← 포맷 불일치 검사
         ↓
  ❌ 하나라도 실패 → PR 머지 차단
  ✅ 모두 통과    → 머지 가능
```

### 4-3. PR 머지 보호 설정 (GitHub 웹)

CI 워크플로우만 있으면 검사를 우회해서 머지할 수 있습니다.
머지를 완전히 차단하려면 GitHub 저장소 설정에서 아래와 같이 추가합니다.

1. GitHub 저장소 → **Settings** → **Branches**
2. `main` 브랜치 규칙에서 **Edit** 클릭
3. **Require status checks to pass before merging** 활성화
4. 검색창에 `lint-and-typecheck` 입력 후 추가
5. **Save changes**

이후 CI가 통과하지 않은 PR은 머지 버튼이 비활성화됩니다.

### 4-4. 커밋 후 확인 방법

```bash
git push origin feature/브랜치명
```

푸시 후 GitHub 저장소 → **Actions** 탭에서 워크플로우 실행 결과를 확인할 수 있습니다.

---

## 5. 커버 범위 요약

| 컨벤션 항목 | Prettier | ESLint | CI (tsc + lint + format) |
|---|:---:|:---:|:---:|
| single quote | ✅ | | ✅ |
| 4 spaces 들여쓰기 | ✅ | | ✅ |
| 세미콜론 | ✅ | | ✅ |
| 트레일링 콤마 | ✅ | | ✅ |
| 줄 길이 120자 | ✅ | | ✅ |
| `console.log` 금지 | | ✅ | ✅ |
| TypeScript 타입 에러 | | | ✅ (tsc) |
| `catch (error)` 변수명 | | △ | — |
| 파일 헤더 주석 | | — | — |

> △ 자동화가 까다로운 항목은 코드 리뷰로 보완합니다.

---

## 자주 묻는 질문

**Q. 팀원이 `npm install`을 안 하면 husky가 동작하지 않나요?**
A. 네. `npm install`을 해야 `prepare` 스크립트가 실행되어 husky 훅이 등록됩니다. `git pull` 후 반드시 `npm install`을 실행하도록 안내하세요.

**Q. Prettier 포맷을 무시하고 커밋하고 싶을 때는?**
A. `git commit --no-verify` 옵션으로 husky 훅을 우회할 수 있습니다. 하지만 CI에서 다시 걸리므로 PR 머지는 불가능합니다.

**Q. 기존 코드가 너무 많이 바뀌어서 diff 보기가 어렵습니다.**
A. Prettier 일괄 포맷 커밋(1-6단계)을 별도 PR로 올려 `git blame`에서 제외 설정을 하면 됩니다.
프로젝트 루트에 `.git-blame-ignore-revs` 파일을 만들고 해당 커밋 해시를 추가하세요.
```
# .git-blame-ignore-revs
# Prettier 일괄 포맷 커밋
<커밋_해시>
```
```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
