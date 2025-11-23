# Mission - Ssujissuji

## 프로젝트 소개

**Mission - Ssujissuji**는 북마크 관리 서비스를 구현한 프로젝트입니다. 사용자는 북마크를 생성, 수정, 삭제, 정렬할 수 있으며, 폴더를 통해 북마크를 체계적으로 관리할 수 있습니다. 이 프로젝트는 웹 애플리케이션 형태로 제공되며, 직관적인 UI와 효율적인 북마크 관리 기능을 목표로 합니다.

---

## 주요 기능

- **북마크 관리**: 북마크 추가, 수정, 삭제 기능 제공
- **폴더 관리**: 폴더 생성, 수정, 삭제 및 북마크 분류
- **정렬 기능**: 북마크와 폴더를 이름, 생성일 등 다양한 기준으로 정렬
- **반응형 디자인**: 다양한 디바이스에서 최적화된 UI 제공

---

## 폴더 구조

```
mission-ssujissuji/
├── public/                     # 정적 파일 (이미지, 아이콘 등)
├── server/                     # 서버 관련 코드
│   └── index.js                # 서버 엔트리 포인트
├── src/                        # 클라이언트 소스 코드
│   ├── assets/                 # 에셋 (CSS, 이미지 등)
│   │   ├── css/                # 글로벌 스타일
│   │   ├── icon/               # 아이콘 파일
│   │   └── images/             # 이미지 파일
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── FolderEditModal.tsx # 폴더 수정 모달 컴포넌트
│   │   ├── FolderList.tsx      # 폴더 리스트 컴포넌트
│   │   ├── home/               # 홈 화면 관련 컴포넌트
│   │   └── ui/                 # UI 관련 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   │   └── useBookmark.ts      # 북마크 관련 훅
│   ├── layout/                 # 레이아웃 관련 코드
│   │   └── RootLayout.tsx      # 기본 레이아웃 컴포넌트
│   ├── pages/                  # 페이지 단위 컴포넌트
│   │   ├── DetailPage.tsx      # 상세 페이지
│   │   └── Home.tsx            # 홈 페이지
│   ├── utils/                  # 유틸리티 함수
│   │   ├── bookmarkTreeUtils.ts # 북마크 트리 관련 유틸리티
│   │   ├── sortBookmarks.ts    # 북마크 정렬 함수
│   │   └── sortFolders.ts      # 폴더 정렬 함수
│   ├── App.tsx                 # 애플리케이션 엔트리 포인트
│   ├── index.css               # 전역 스타일
│   └── main.tsx                # 클라이언트 엔트리 포인트
├── package.json                # 프로젝트 설정 및 의존성
├── tailwind.config.js          # TailwindCSS 설정
├── tsconfig.json               # TypeScript 설정
└── vite.config.ts              # Vite 설정
```

---

## 실행 방법

### 1. 의존성 설치

프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 필요한 패키지를 설치합니다.

```bash
npm install
```

### 2. 개발 서버 실행

아래 명령어를 실행하여 로컬 개발 서버를 시작합니다.

```bash
npm run dev
```

### 3. 빌드

프로덕션 환경에서 사용할 애플리케이션을 빌드하려면 아래 명령어를 실행합니다.

```bash
npm run build
```

---

## 기술 스택

- **프론트엔드**: React, TypeScript, TailwindCSS
- **번들러**: Vite
- **백엔드**: Node.js (Express)

---
