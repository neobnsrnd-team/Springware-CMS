# feat #51 : CMS 이미지 자산 선택 화면(/cms/files) 통일 및 에디터 연동 개선

## 🔗 관련 이슈 (Related Issues)

- #51

## ✨ 변경 사항 (Changes)

금융 컴포넌트 에디터 곳곳에 흩어져 있던 **로컬 파일 업로드 경로를 모두 제거**하고, 승인된 이미지를 고르는 **단일 진입점 `/cms/files`**로 일원화했습니다. `/cms/files` 자체도 spider-admin `/cms-admin/asset-approvals` 화면과 스타일을 맞춘 전용 브라우저로 재구성했습니다.

### 1. `/cms/files` 재구성 — `AssetBrowser.tsx`

- 검색 조건 카드: 카테고리 select(FWK_CODE `CMS00001`) + 이미지명 LIKE + 페이지 크기(20/30/50/100/200) + 조회/초기화/선택완료
- **좌측 폴더 사이드바**: 자산 `ASSET_PATH`에서 파생한 폴더명 리스트(현재 단일 `img`, 다중 deploy 시 자동 확장). 상단 우측 햄버거로 접고 펼침
- **이미지 그리드**: 고정폭 카드(`grid-cols-[repeat(auto-fill,180px)]`) → 사이드바 토글에 무관하게 카드 크기 일정
- **단일 선택**: 같은 카드 재클릭 시 해제, 다른 카드 클릭 시 교체. `postMessage` 포맷 `{ type: 'ASSETS_SELECTED', urls: [url] }`
- 상단 우측 **X 닫기** — 팝업이면 `window.close()`, 단독 접근이면 `history.back()`

### 2. 에디터 이미지 입력을 `/cms/files` 선택으로 통일

- 공용 헬퍼 `src/lib/cms-file-picker.ts`의 `openCmsFilesPicker((url) => …)`로 모든 편집 패널 통합
- 적용 대상: `EventBannerEditor`, `PopupBannerEditor`, `AuthCenterIconEditor`, `ProductMenuIconEditor`, `SlideEditorModal`
- `EditClient.tsx`의 `#fileEmbedImage` 인터셉트 유지(이미지 블록의 "이미지 변경" → /cms/files)
- ContentBuilder **설정 → 배경 이미지** 패널의 로컬 업로드 영역은 `globals.css`에서 `.form-upload-larger`·`.image-larger1~4` 을 `display:none` 처리. 동일 패널의 "Open Asset" 버튼만 남아 `/cms/files`로 유도.

### 3. 카테고리 · 폴더 데이터 정합화

- `src/app/api/cms-admin/asset-categories/route.ts` 신규 — 공유 FWK_CODE 직접 조회 + 허용 코드(COMMON/CARD/LOAN/DEPOSIT) 필터로 spider-admin과 동일한 목록 반환(로컬에서 spider-admin 프록시 시 발생하던 502 해소)
- `src/lib/cms-asset-category.ts` 신규 — 카테고리 그룹 ID·허용 코드·라벨 상수 집중화
- 카드 하단 뱃지: 허용 코드 매칭 → codeName, 미매칭 → 원본 code, 값 없음 → `-` 폴백

### 4. 숨김·미배포 자산 배제(필터 보강)

- **SQL** (`asset.sql.ts`): `ASSET_SELECT_LIST`/`ASSET_COUNT`에 `WHERE USE_YN = 'Y'` 고정(주석 명시)
- **API** (`/api/assets/route.ts`): `force-dynamic` + `revalidate=0`으로 캐시 무효화, 응답에 `useYn`·`path` 추가
- **클라이언트** (`AssetBrowser.tsx`): `fetch(..., { cache: 'no-store' })` + `useYn !== 'Y'` 자산 제거 + `isDeployedAsset()`로 `path`에 `/deployed/`가 없는 자산(=`uploads/` 잔존분) 제거

### 5. 이미지 렌더·전달 정합성

- `src/app/files/page.tsx`가 `CMS_BASE_URL`을 `AssetBrowser`에 `assetOrigin` prop으로 전달
- `resolveAssetSrc(url, assetOrigin)`로 루트 상대 경로를 절대 URL로 변환 → 로컬 dev에서도 원격 nginx 이미지 로드
- **핵심 버그 수정**: `handleConfirm`이 에디터로 `postMessage` 할 때 절대 URL을 보내 `/cms/edit`에서 이미지 깨짐·사라짐 현상 해소

### 6. 자잘한 픽스

- 응답 파싱 버그: `json.data?.assets` → `json.assets`, `json.data?.totalCount` → `json.totalCount` (이전 항상 빈 목록)
- `handleReset`에 `setFolder('')` 추가
- CMS 스케줄러 의존성 설치 상태 복구
- spider-admin 전용 안내문(`승인된 이미지만 표시됩니다`) 제거

### 파일 변경 요약

| 구분 | 파일 | 변경 |
|---|---|---|
| 신규 | `src/components/files/AssetBrowser.tsx` | 승인 이미지 전용 브라우저 |
| 신규 | `src/lib/cms-file-picker.ts` | `openCmsFilesPicker` 헬퍼 |
| 신규 | `src/lib/cms-asset-category.ts` | 카테고리 상수 |
| 신규 | `src/app/api/cms-admin/asset-categories/route.ts` | 공유 FWK_CODE 직접 조회 |
| 수정 | `src/app/files/page.tsx` | `CMS_BASE_URL` prop 전달 |
| 수정 | `src/app/api/assets/route.ts` | `force-dynamic`, `useYn`/`path` 노출 |
| 수정 | `src/app/api/builder/upload/route.ts` | 업로드 경로 정리 |
| 수정 | `src/db/queries/asset.sql.ts` | `USE_YN='Y'` 주석 명시 |
| 수정 | `src/db/repository/asset.repository.ts` | 바인딩 정리 |
| 수정 | `src/components/edit/EditClient.tsx` | 로컬 `upload` 차단 안내 |
| 수정 | `src/components/edit/EventBannerEditor.tsx` | /cms/files 선택 전환 |
| 수정 | `src/components/edit/PopupBannerEditor.tsx` | /cms/files 선택 + 썸네일 |
| 수정 | `src/components/edit/AuthCenterIconEditor.tsx` | 동일 |
| 수정 | `src/components/edit/ProductMenuIconEditor.tsx` | 동일 |
| 수정 | `src/components/edit/SlideEditorModal.tsx` | 동일(2개 지점) |
| 수정 | `src/components/files/FileBrowser.tsx` | 레거시 구조 소폭 정리 |
| 수정 | `src/app/globals.css` | 배경 이미지 로컬 업로드 영역 숨김 |
| 수정 | `src/lib/codes.ts` | 상수 이동에 따른 정리 |

통계: **19 files changed, +930 / −283**

## 📸 변경 사항 확인 (선택)

| 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- |
| (이미지/GIF) | (이미지/GIF) |

- `/cms/files` 좌측 폴더 사이드바 + 햄버거 토글 + 상단 우측 X 버튼
- 이벤트 배너/팝업 배너 편집 패널의 [이미지 선택] 버튼 + 미리보기
- ContentBuilder 배경 이미지 패널에서 로컬 업로드 영역이 사라지고 "Open Asset"만 보이는 상태

## ⚠️ 고려 및 주의 사항 (선택)

- **dev/prod URL 분기**: `assetOrigin(=CMS_BASE_URL)`을 붙인 절대 URL이 저장 HTML에 박히는 구조입니다. 운영 도메인이 바뀌면 기존 저장 HTML 이미지가 영향을 받을 수 있어, 필요 시 save 단계에서 origin 제거(상대 URL 저장) 후 render 시 재주입 방식으로의 전환을 검토할 필요가 있습니다.
- **폴더 필터는 현재 클라이언트 필터**: 단일 `img` 폴더뿐이라 기능상 충분하지만, 다중 폴더가 도입되면 `/api/assets`에 `folder` 쿼리 파라미터를 추가해 서버 필터로 승격이 필요합니다.
- **ContentBuilder 로컬 업로드 차단은 CSS 기반**입니다. 업스트림 업데이트로 클래스명이 바뀌면 `.form-upload-larger`·`.image-larger1~4` 재점검이 필요합니다.
- **캐시 무효화**: `/api/assets`에 `force-dynamic` + `no-store`를 걸어 spider-admin 숨김 처리가 즉시 반영되도록 했습니다. 트래픽이 많은 환경에서 부하 양상이 달라질 수 있으니 모니터링 포인트로 두는 편이 좋습니다.

## 💬 리뷰 포인트 (선택)

- `resolveAssetSrc`가 절대 URL을 에디터로 넘기는 설계에 대한 의견 — 장기적으로 상대 URL 저장 + 렌더 시 주입 방식이 더 낫다면 마이그레이션 시점 논의 부탁드립니다.
- 사이드바 "폴더"의 파생 기준(`ASSET_PATH`의 파일명 직전 세그먼트) 정책이 다중 폴더 시나리오에서도 합당한지 검토 부탁드립니다.
- `AssetBrowser.tsx`의 이중 방어(서버 SQL `USE_YN='Y'` + 클라이언트 `useYn` 필터) 중 클라이언트 필터는 과방어일 수 있어 유지/제거 의견 주시면 반영하겠습니다.
- ContentBuilder 로컬 업로드 영역을 **CSS로 숨긴** 방식이 허용 가능한 수준인지, 혹은 `largerImageHandler` 옵션 조정으로 대체해야 하는지 검토 부탁드립니다.

## 🔗 참고 사항 (선택)

- spider-admin 쪽 관련 변경(별도 저장소): `admin/src/main/resources/mapper/oracle/cmsasset/CmsAssetMapper.xml`의 `existsByAssetId`에서 `USE_YN='Y'` 필터 제거 — 숨김→노출 토글 복원 워크플로 정상화용이며 본 PR과 독립적. CMS 측 필터 로직에는 영향 없음.
- 레퍼런스: spider-admin `/cms-admin/asset-approvals` 화면(카테고리 로드·검색 조건 UI 스타일의 기준).
- 주요 커밋: `e71b863` `eb97405` `1e54b84` `57717cd` `7969bc2` `8cf078a` `7f5076d` `02b6064` `21fef7a` `e622fac`
