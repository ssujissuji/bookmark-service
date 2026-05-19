# CHANGELOG

모든 주요 변경 사항을 이 파일에 기록합니다.  
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 합니다.

---

## [Unreleased]

### In Progress — i18n 다국어 지원 (`feat/locale-based-language`)

#### Phase 1 완료 — i18n 인프라 구축
- `i18next` + `react-i18next` + `i18next-browser-languagedetector` 설치
- 번역 파일 생성 (`src/app/locales/ko`, `src/app/locales/en`) — 한글 문자열 전체 키 정의 완료
- `i18n.ts` 초기화 파일 추가 (브라우저 언어 자동 감지, 폴백 `ko`)
- Chrome `_locales` 디렉토리 추가 (`public/_locales/ko`, `public/_locales/en`)
- `manifest.config.js` — `default_locale: 'ko'` 추가
- `main.tsx` — `i18n` 초기화 import 추가

#### Phase 2 완료 — 컴포넌트 한글 문자열 교체
- `useTranslation()` 훅 도입, 13개 파일 한글 문자열 전체 `t('key')` 교체
  - UI 컴포넌트: `Navbar`, `BookMarkCardList`, `FolderEditModal`, `BookmarkEditModal`, `SelectBox`, `Header`, `InputComponent`, `ThemeSwitch`, `Footer`, `NewBookMark`
  - 페이지: `DetailPage`
  - 커스텀 훅: `useFoldersActions`, `useUrlActions` (toast 메시지)
  - `window.confirm()` 문자열 영어 처리 포함

#### Phase 3 완료 — 정렬 현지화 및 누락 문자열 처리
- `sortBookmarks.ts` locale 파라미터 추가, `i18n.language` 기반 동적 정렬
- `BookMarkCardList.tsx` 하드코딩 `'ko'` 제거
- `BookmarkCard.tsx`, `BookmarkListItem.tsx` 누락 한글 문자열 처리
- 번역 파일 `toast.moved`, `confirm.deleteBookmark` 키 추가

#### Phase 5 완료 — 언어 수동 전환 UI
- Footer에 KO/EN 토글 버튼 추가 (현재 언어의 반대 언어 표시)
- `localStorage` 기반 언어 선택 저장 (재방문 시 유지)
- `i18n.ts` 감지 순서 변경: `localStorage` → `navigator` (수동 선택 우선)
- `nonExplicitSupportedLngs: true` 추가 — `en-US`, `ko-KR` 등 지역 코드 자동 매칭

#### 예정
- Phase 4: Chrome Web Store 스토어 리스팅 영어 추가 (수동 작업)

자세한 내용은 [WORK.md](./WORK.md) 참조

---

## [1.5.4] - 2025-05

### Fixed
- 테마 전환 시 가로 스크롤 카드 밀림 현상 제거
- 테마 전환 시 배경 스크롤 현상 제거

---

## [1.5.3] - 2025-05

### Fixed
- 테마 변경 스위치 오류 수정 — 버튼 클릭으로 테마가 변경되는 불편함 제거, 테마 카드 클릭 시에만 적용되도록 수정
- Footer 높이 부족으로 발생하던 y-scroll 현상 수정 (`h-[40vh]`)

### Improved
- Footer 테마 변경 아이콘을 `button` 태그로 감싸 스크린리더 접근성 향상
- 새 폴더 생성 카드 디자인을 기존 북마크 폴더 카드와 통일

---

## [1.5.2] - 2025-04

### Added
- 폴더 아이콘 색상 변경 기능 추가

### Changed
- 폴더 아이콘 디자인 통일 (스타일 일관성)
- 테마 변경 아이콘 교체 — 다크모드 아이콘 → 페인트 아이콘 (직관성 개선)

### Removed
- 사용하지 않는 `IconInputComponent` 컴포넌트 삭제

---

## [1.5.1] - 2025-04

### Fixed
- `global.css` 배경 이미지 import 이름 오타 수정
- 이미지 파일 이름 공백 제거

---

## [1.5.0] - 2025-04

### Added
- 테마 변경 기능 추가 (black / bed / hologram / snow 테마)
- Footer 추가 — 테마 변경 진입점 및 버전 표시

### Removed
- 북마크 데이터 로드 관련 불필요한 console 제거

---

## [이전 버전]

git log 참조: `git log --oneline`
