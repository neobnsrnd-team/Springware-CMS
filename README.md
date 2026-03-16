# Springware CMS

금융권 특화 비주얼 웹 콘텐츠 빌더. 개발자가 아닌 사람도 드래그앤드랍으로 금융권 모바일 앱 화면을 만들 수 있는 에디터입니다.

## 기술 스택

- **Next.js 15.5.4** (App Router) + **React 19** + **TypeScript**
- **ContentBuilder.js** — 비주얼 에디터 라이브러리 (Innova Studio)
- **Tailwind CSS 4**
- **AI**: OpenRouter / OpenAI / FAL AI (이미지 생성)

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

| URL | 설명 |
|-----|------|
| `http://localhost:3000/edit` | 에디터 (메인 작업 화면) |
| `http://localhost:3000/view` | 저장된 결과물 미리보기 |
| `http://localhost:3000/files` | 파일 브라우저 |

## 환경변수

프로젝트 루트에 `.env` 파일 생성 후 아래 키 입력:

```env
OPENROUTER_API_KEY=   # AI 코드 생성 (기본 프로바이더)
OPENAI_API_KEY=       # AI 대안 프로바이더
FAL_API_KEY=          # AI 이미지 생성 (fal.ai)
GEMINI_API_KEY=       # Google GenAI
UPLOAD_PATH=          # 업로드 경로 (기본: public/uploads/)
UPLOAD_URL=           # 업로드 URL (기본: uploads/)
```

## 데이터 저장 방식

현재 DB 없이 파일 기반으로 동작합니다.

| 데이터 | 저장 위치 | 비고 |
|--------|-----------|------|
| 에디터 캔버스 HTML | `data/*.json` (서버 파일) | Save 버튼 → API → 파일 쓰기 |
| 탭 목록 | 브라우저 `localStorage` | 같은 PC/브라우저에서만 유지 |
| 업로드 이미지 | `public/uploads/` | 정적 서빙 |

```
data/
├── ibk.json          # IBK 탭 저장 내용
├── hana.json         # 하나 탭
└── custom-xxx.json   # + 버튼으로 추가한 커스텀 탭
```

> 프로덕션 전환 시 `data/*.json` → DB, `public/uploads/` → S3로 교체 필요

## 금융 컴포넌트

우측 패널 "금융 컴포넌트" 탭에서 드래그하거나 + 클릭으로 캔버스에 추가합니다.

| 컴포넌트 | 설명 |
|----------|------|
| 앱 헤더 (`app-header`) | 로고·메뉴·햄버거 헤더 |
| 퀵뱅킹 메뉴 (`product-menu`) | 아이콘 그리드 (조회·이체·카드 등) |
| 상품 갤러리 (`product-gallery`) | 스와이프 카드 (예금·적금·대출 금리) |
| 환율 보드 (`exchange-board`) | USD·EUR·JPY·CNY 환율 + 환전 신청 |
| 영업점/ATM (`branch-locator`) | 지도 + 영업점 목록 바텀시트 |
| 홍보 배너 (`promo-banner`) | 스와이프 배너 + 유튜브 임베드 |
| 금융 계산기 (`loan-calculator`) | 대출·예금·적금 탭 전환 계산기 |
| 보안인증센터 (`auth-center`) | 공동인증서·금융인증서·OTP·보안카드 |

> 모든 금융 컴포넌트는 우측 패널에서 색상 편집 가능 (은행 브랜드 대표색 팔레트 포함)

## API 구조

```
/api/builder/load       탭 콘텐츠 불러오기
/api/builder/save       탭 콘텐츠 저장
/api/builder/upload     이미지 업로드
/api/manage/*           파일 브라우저 (목록·폴더·삭제)
/api/openrouter         AI 코드 생성 프록시
/api/openai             AI 대안 프록시
/api/assets/*           FAL AI 이미지 생성
/api/exchange           환율 데이터
/api/branches           지점 데이터
```

## 프로젝트 구조

```
src/
├── app/
│   ├── edit/EditClient.tsx     # 에디터 핵심 — ContentBuilder 초기화, 탭 관리
│   ├── view/ViewClient.tsx     # 저장된 HTML 렌더링
│   ├── files/                  # 파일 브라우저
│   └── api/                    # 서버 API 라우트
├── components/files/           # 파일 브라우저 UI 컴포넌트
public/
├── assets/plugins/             # 금융·범용 컴포넌트 플러그인 (lazy-load)
│   └── _shared/color-picker.js # 공유 색상 피커 유틸리티
└── uploads/                    # 업로드된 파일
data/                           # 저장된 캔버스 콘텐츠 (JSON)
docs/                           # 기술 문서
```

자세한 기술 내용은 [docs/technical-overview.md](docs/technical-overview.md) 참고.
