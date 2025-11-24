# Mission - Ssujissuji

## 프로젝트 소개

- 북마크 관리 서비스의 웹 UI를 담당.
- 사용자가 폴더별로 북마크를 한눈에 보고, 정렬·수정·삭제할 수 있는 화면을 제공하며, 북마크를 더 보기 좋게 정리하고 탐색할 수 있도록 돕는 인터페이스를 구현


---

## 폴더 구조

```
mission-ssujissuji/
├── public/                     # 정적 파일
├── server/                     # 서버 코드
├── src/                        # 클라이언트 소스 코드
│   ├── assets/                 # 에셋 (CSS, 이미지 등)
│   ├── components/             # 재사용 가능한 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── layout/                 # 레이아웃 코드
│   ├── pages/                  # 페이지 컴포넌트
│   ├── utils/                  # 유틸리티 함수
│   ├── App.tsx                 # 애플리케이션 엔트리 포인트
│   └── main.tsx                # 클라이언트 엔트리 포인트
├── package.json                # 프로젝트 설정
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
