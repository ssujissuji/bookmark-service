# Bookmark Extension

## 프로젝트 소개

- 크롬 브라우저에서 바로 북마크를 확인하고 정렬·검색할 수 있게 해주는 확장 프로그램


---


## 폴더 구조

```
bookmark-extension/
├── manifest.config.js           # Manifest 설정
├── package.json                 # 프로젝트 설정 및 의존성
├── tsconfig.json                # TypeScript 기본 설정
├── vite.config.js               # Vite 설정
├── public/                      # 정적 파일 (아이콘, 이미지 등)
├── release/                     # 배포 파일
├── src/                         # 소스 코드
│   ├── background.ts            # 백그라운드 스크립트
│   ├── components/              # 재사용 가능한 컴포넌트
│   ├── popup/                   # 팝업 UI

```

---

## 실행 방법

### 1. 의존성 설치

프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 필요한 패키지를 설치합니다.

```bash
npm install
```

### 2. 개발 서버 실행

아래 명령어를 실행하여 개발 환경에서 확장 프로그램을 실행합니다.

```bash
npm run dev
```

### 3. 확장 프로그램 빌드

프로덕션 환경에서 사용할 확장 프로그램을 빌드하려면 아래 명령어를 실행합니다.

```bash
npm run build
```

### 4. 브라우저에 로드

1. 빌드가 완료되면 `release/` 폴더가 생성됩니다.
2. 브라우저의 확장 프로그램 관리 페이지에서 "압축 해제된 확장 프로그램 로드"를 선택합니다.
3. `release/` 폴더를 선택하여 확장 프로그램을 로드합니다.

---

## 기술 스택

- **프론트엔드**: React, TypeScript
- **번들러**: Vite
- **브라우저 API**: Chrome Extensions API
