# WORK.md — 작업 계획서

> 현재 진행 중인 개발 계획과 작업 상태를 추적하는 문서입니다.

---

## 현재 목표: 영어권 다국어 지원 (i18n)

**배경:**  
확장 프로그램 이름이 영어라 영어권에서 검색 유입이 발생하지만,  
UI 전체가 한국어로만 되어 있어 이탈률이 높은 상황.  
브라우저 언어 감지 기반으로 한국어/영어를 자동 지원하도록 개선.

---

## Phase 1 — i18n 기술 인프라 구축 ✅

**목표:** 다국어 지원 가능한 코드 구조로 전환

- [x] `i18next` + `react-i18next` + `i18next-browser-languagedetector` 설치
- [x] 번역 파일 구조 생성
  ```
  src/app/locales/
  ├── ko/translation.json
  └── en/translation.json
  ```
- [x] `i18n.ts` 초기화 파일 작성 (브라우저 언어 자동 감지, 폴백 `ko`)
- [x] Chrome Extension `_locales` 디렉토리 구성
  ```
  public/_locales/
  ├── ko/messages.json
  └── en/messages.json
  ```
- [x] `manifest.config.js`에 `"default_locale": "ko"` 추가
- [x] `main.tsx`에 `import '@/app/i18n'` 추가

---

## Phase 2 — 한글 문자열 추출 및 번역 ✅

**목표:** 하드코딩된 한글 약 50개를 번역 키로 교체

### 대상 파일 및 문자열

| 파일 | 대상 문자열 (한글) | 번역 키 |
|------|-------------------|---------|
| `Navbar.tsx` | 최신순, 이름순 | `sort.recent`, `sort.name` |
| `BookMarkCardList.tsx` | 북마크바, 기타 북마크, + 새북마크 | `section.bookmarkBar`, `section.other`, `action.newBookmark` |
| `FolderEditModal.tsx` | 새로운 폴더 생성, 폴더 수정, 폴더명을 입력해주세요., 생성, 취소 | `modal.createFolder`, `modal.editFolder`, `placeholder.folderName`, `action.create`, `action.cancel` |
| `BookmarkEditModal.tsx` | 새로운 북마크 생성, 북마크 설정 변경, 북마크 이름 입력, URL 입력 | `modal.createBookmark`, `modal.editBookmark`, `placeholder.bookmarkName`, `placeholder.url` |
| `SelectBox.tsx` | 수정, 삭제 | `action.edit`, `action.delete` |
| `Header.tsx` | 폴더 이름이 변경되었습니다. | `toast.folderRenamed` |
| `InputComponent.tsx` | 글자 수 제한을 초과했습니다. | `error.charLimit` |
| `ThemeSwitch.tsx` | 테마 선택 닫기, 닫기 | `theme.close`, `action.close` |
| `DetailPage.tsx` | 여기로 드롭하면 반대 루트로 이동 | `dnd.dropHint` |
| hooks (toast) | 폴더/북마크 생성·수정·삭제·이동 메시지 6종 | `toast.*` |

- [x] 번역 키 전체 정의 (`ko/translation.json`, `en/translation.json`)
- [x] 각 컴포넌트에서 `useTranslation()` 훅 적용 및 `t('key')` 교체
- [x] `window.confirm()` 한글 메시지 영어 처리

---

## Phase 3 — 정렬 현지화 및 누락 문자열 처리 ✅

- [x] 이름 정렬 `localeCompare()` → `i18n.language` 동적 적용
  - `sortBookmarks.ts` — `locale?` 파라미터 추가
  - `BookMarkCardList.tsx` — 하드코딩 `'ko'` 제거
  - `DetailPage.tsx` — `i18n.language` 전달
- [x] Phase 2 누락 파일 처리 (`BookmarkCard.tsx`, `BookmarkListItem.tsx`)
  - confirm, toast 메시지 번역키 교체
  - 번역 파일에 `toast.moved`, `confirm.deleteBookmark` 키 추가

---

## Phase 4 — Chrome Web Store 스토어 리스팅 개선 (다음 작업)

**목표:** 영어권 검색 → 설치 전환율 개선

- [ ] 영어 스토어 설명문 작성 (SEO 키워드 포함)
  - 키워드 예시: `bookmark manager`, `bookmark organizer`, `new tab bookmarks`, `chrome bookmark extension`
- [ ] 영어 UI 기반 스크린샷 재촬영 (또는 다국어 병행 표시 스크린샷)
- [ ] `Footer.tsx` 피드백 링크 문구 영어 버전 추가

---

## Phase 5 — 언어 수동 전환 UI (선택)

- [ ] 설정 영역에 언어 토글 버튼 (KO / EN) 추가
- [ ] 선택 언어를 `chrome.storage.sync`에 저장 (기기 간 동기화)

---

## 진행 순서

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 (선택)
```

Phase 4 (스토어)는 Phase 1~3 완료 후 진행.  
Phase 5는 유저 피드백 보고 결정.

---

## 참고

- 현재 버전: `1.5.4`
- i18n 작업 완료 목표 버전: `1.6.0`
- 스토어 URL: https://chromewebstore.google.com/detail/gibfpdopdjmfjfablclemgpbfgihlbne
