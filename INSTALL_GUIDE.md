# 🚀 Wonik Health - PC 설치 가이드

## 📋 목차
1. [사전 준비사항](#사전-준비사항)
2. [프로젝트 다운로드](#프로젝트-다운로드)
3. [설치 파일 빌드](#설치-파일-빌드)
4. [앱 설치 및 실행](#앱-설치-및-실행)
5. [문제 해결](#문제-해결)

---

## 🛠️ 사전 준비사항

### 1. Node.js 설치
Wonik Health를 빌드하려면 **Node.js v16 이상**이 필요합니다.

#### Node.js 설치 방법:
1. **공식 웹사이트 방문**: https://nodejs.org/
2. **LTS(Long Term Support) 버전 다운로드** (권장)
3. 설치 프로그램 실행 후 기본 옵션으로 설치

#### 설치 확인:
```bash
# 명령 프롬프트(CMD) 또는 PowerShell에서 실행
node --version
npm --version
```

예상 출력:
```
v22.14.0
10.9.2
```

---

## 📥 프로젝트 다운로드

### 방법 1: Git Clone (추천)
```bash
git clone https://github.com/ohjihoon05/wonik-health.git
cd wonik-health
```

### 방법 2: ZIP 파일 다운로드
1. GitHub 저장소 방문: https://github.com/ohjihoon05/wonik-health
2. **Code** 버튼 클릭 → **Download ZIP**
3. 압축 해제 후 폴더로 이동

---

## 🔨 설치 파일 빌드

### 1단계: 의존성 패키지 설치
```bash
# 프로젝트 폴더에서 실행
npm install
```

⏱️ **소요 시간**: 약 2-5분 (인터넷 속도에 따라 다름)

### 2단계: Windows 설치 파일 빌드

#### 옵션 A: 설치 프로그램 + 포터블 버전 빌드 (추천)
```bash
npm run build:win
```

생성되는 파일:
- `dist/WonikHealth-Setup-1.2.0.exe` - **설치 프로그램** (권장)
- `dist/WonikHealth-Portable-1.2.0.exe` - **포터블 버전** (설치 없이 실행)

#### 옵션 B: 빠른 테스트 빌드
```bash
npm run build:dir
```
실행 파일만 생성 (설치 프로그램 없음)

⏱️ **소요 시간**: 약 3-10분

---

## 💻 앱 설치 및 실행

### 방법 1: 설치 프로그램 사용 (권장)

1. **`dist/WonikHealth-Setup-1.2.0.exe` 실행**
2. 설치 마법사 따라하기:
   - 설치 경로 선택
   - 바탕화면 바로가기 생성 여부
   - 시작 메뉴 바로가기 생성 여부
3. 설치 완료 후 자동으로 앱 실행

#### 설치 위치:
- 기본: `C:\Users\[사용자명]\AppData\Local\Programs\wonik-health\`
- 바탕화면 바로가기: 생성됨
- 시작 메뉴: `Wonik Health`

### 방법 2: 포터블 버전 사용

1. **`dist/WonikHealth-Portable-1.2.0.exe`를 원하는 폴더에 복사**
2. 더블클릭으로 실행
3. 설치 없이 바로 사용 가능

💡 **포터블 버전 장점**:
- USB에 넣어서 이동 가능
- 설치 권한 불필요
- 회사 보안 정책으로 설치가 제한된 경우 유용

---

## ✅ 앱 기능 확인

설치 후 다음 기능들이 정상 작동하는지 확인하세요:

### 1. 질병별 업무 스케줄링
- ✅ 질병 선택 (편두통, 디스크 문제 등)
- ✅ 맞춤 업무 시간 설정
- ✅ 휴식 알림

### 2. 약물 관리
- ✅ 약물 추가/삭제
- ✅ 복용 시간 알림
- ✅ 복용 기록 추적

### 3. AI 추천 시스템
- ✅ 질병별 생활 패턴 추천
- ✅ 업무 최적화 제안

---

## 🐛 문제 해결

### 문제 1: `npm install` 실패

#### 증상:
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

#### 해결책:
```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rmdir /s /q node_modules
npm install
```

---

### 문제 2: 빌드 중 "ENOENT" 오류

#### 증상:
```
Error: ENOENT: no such file or directory
```

#### 해결책:
```bash
# 필수 폴더 생성
mkdir assets
mkdir dist

# 다시 빌드
npm run build:win
```

---

### 문제 3: Electron 다운로드 실패

#### 증상:
```
RequestError: getaddrinfo EAI_AGAIN github.com
```

#### 해결책:
```bash
# 프록시 설정 (회사 네트워크인 경우)
npm config set proxy http://프록시주소:포트
npm config set https-proxy http://프록시주소:포트

# 재시도
npm install
```

---

### 문제 4: 설치 후 앱이 실행되지 않음

#### 해결책 1: 관리자 권한으로 실행
- 설치 파일 우클릭 → **관리자 권한으로 실행**

#### 해결책 2: Windows Defender 예외 추가
1. Windows 보안 → 바이러스 및 위협 방지
2. 설정 관리 → 제외 추가
3. Wonik Health 설치 폴더 추가

#### 해결책 3: 재설치
```bash
# 기존 설치 제거
제어판 → 프로그램 제거 → Wonik Health 제거

# 재설치
WonikHealth-Setup-1.2.0.exe 실행
```

---

### 문제 5: 알림이 표시되지 않음

#### 해결책:
1. **Windows 알림 설정 확인**
   - 설정 → 시스템 → 알림
   - "앱 및 기타 보내는 사람의 알림 받기" 활성화
   - Wonik Health 알림 권한 활성화

2. **앱 내 권한 확인**
   - 앱 첫 실행 시 알림 권한 허용

---

## 📊 빌드 옵션 상세

### 전체 빌드 명령어

```bash
# 개발 모드 실행 (빌드 없이 테스트)
npm start

# 개발 모드 (로그 포함)
npm run dev

# 설치 프로그램 + 포터블 빌드
npm run build:win

# 모든 플랫폼 빌드 (Windows만 지원)
npm run build

# 빠른 테스트 빌드
npm run build:dir

# dist 폴더에 최종 빌드
npm run dist
```

---

## 📁 빌드 결과물

빌드 완료 후 `dist/` 폴더에 다음 파일들이 생성됩니다:

```
dist/
├── WonikHealth-Setup-1.2.0.exe          # 설치 프로그램 (약 70MB)
├── WonikHealth-Portable-1.2.0.exe       # 포터블 버전 (약 70MB)
├── win-unpacked/                         # 압축 해제된 앱 파일
└── builder-effective-config.yaml         # 빌드 설정 정보
```

---

## 🎯 권장 설치 방법 요약

### 개인 PC (집)
✅ **설치 프로그램 사용**
- 바탕화면 바로가기 생성
- 자동 업데이트 지원
- 시작 메뉴 통합

### 회사 PC (원익IPS)
✅ **포터블 버전 사용**
- 설치 권한 불필요
- IT팀 승인 대기 시간 없음
- 개인 폴더에 저장

---

## 🚀 다음 단계

### 설치 후 할 일
1. ✅ 앱 실행 확인
2. ✅ 알림 권한 허용
3. ✅ 질병 정보 설정
4. ✅ 약물 정보 입력
5. ✅ 첫 번째 알림 테스트

### 고급 사용자
- **개발 모드 실행**: `npm start`
- **디버그 모드**: `npm run dev`
- **소스 코드 수정**: `main.js`, `index.html`, `storage.js`
- **재빌드**: `npm run build:win`

---

## 📞 지원

### 문제 발생 시
1. **GitHub Issues**: https://github.com/ohjihoon05/wonik-health/issues
2. **개발자 연락**: 원익IPS SW팀 지훈

### 관련 문서
- `README.md` - 프로젝트 개요
- `CLAUDE.md` - 개발 진행사항
- `TECH_STACK.md` - 기술 스택
- `ROADMAP.md` - 개발 로드맵

---

## 🎉 설치 완료!

축하합니다! Wonik Health가 성공적으로 설치되었습니다.

이제 건강한 업무 생활을 시작하세요! 💊⏰
