# CLAUDE.md - Wonik Health 프로젝트 개발 가이드

## 📋 프로젝트 개요
- **프로젝트명**: Wonik Health - 질병별 맞춤 업무 스케줄링 앱
- **기술스택**: Electron + React + JavaScript + localStorage
- **목표**: 만성질환자를 위한 개인 맞춤형 약물 관리 및 업무 스케줄링 데스크톱 앱
- **개발자**: 지훈 (원익IPS UX 디자이너) - 첫 개발 프로젝트

## 🚀 현재 개발 진행 상황

### ✅ **Phase 0: 개발환경 설정** (완료)
- Node.js v22.14.0 설치 확인
- Electron 기본 앱 구조 생성
- package.json 설정
- "Hello World" 앱 실행 성공

**핵심 파일들:**
- `main.js` - Electron 메인 프로세스
- `index.html` - 메인 UI 화면
- `package.json` - 프로젝트 설정

### ✅ **Phase 1: 기본 알림 시스템** (완료)
- Windows 알림 API 연동
- 버튼 클릭 시 알림 표시 기능
- 글래스모피즘 디자인 적용
- 알림 클릭 이벤트 처리

**구현된 기능:**
- 💊 알림 테스트 버튼
- Windows 네이티브 알림 표시
- 알림 권한 요청 및 처리

### ✅ **Phase 2: 약물 데이터베이스 + CRUD** (완료)
- localStorage 기반 데이터 저장소 구현
- 약물 추가/삭제/조회 기능
- 실시간 목록 업데이트
- 데이터 영속성 확보

**핵심 파일들:**
- `storage.js` - localStorage 기반 데이터 관리
- 약물 추가 폼 (이름, 용량, 시간)
- 약물 목록 표시 및 삭제 기능

**구현된 기능:**
- 약물 정보 입력 폼
- 약물 목록 실시간 표시
- 약물 삭제 확인 대화상자
- 앱 재시작 후 데이터 유지

### 🔄 **Phase 3: 스마트 알림 시스템** (다음 단계)
**계획된 기능:**
- 설정한 시간에 자동 알림
- 백그라운드 스케줄러
- 알림 스누즈 기능
- 복용 완료 처리

### 🔄 **Phase 4: UI 개선** (예정)
**계획된 기능:**
- Magic MCP를 활용한 모던 컴포넌트
- 더 나은 UX/UI 디자인
- 반응형 레이아웃

### 🔄 **Phase 5: 배포 준비** (예정)
**계획된 기능:**
- Electron Builder 설정
- Windows .exe 파일 생성
- 자동 업데이트 시스템

## 🛠️ 기술적 결정사항

### 데이터 저장방식 변경
**초기 계획:** SQLite 데이터베이스
**변경된 방식:** localStorage
**변경 이유:** 
- SQLite의 Node.js 버전 호환성 문제
- 첫 개발 프로젝트라서 더 간단한 방식 선택
- localStorage도 충분히 안정적이고 사용하기 쉬움

### 보안 설정 단순화
**초기 계획:** contextIsolation + preload.js
**변경된 방식:** nodeIntegration: true
**변경 이유:**
- 개발 단계에서 더 빠른 프로토타이핑
- 내부 사용 목적으로 보안 요구사항 완화

## 📁 프로젝트 구조

```
wonik-health-planning/
├── main.js              # Electron 메인 프로세스
├── index.html           # 메인 UI 화면
├── storage.js           # localStorage 데이터 관리
├── package.json         # 프로젝트 설정
├── README.md           # 프로젝트 개요
├── TECH_STACK.md       # 기술 스택 문서
├── UI_WIREFRAME.md     # UI 디자인 가이드
├── ROADMAP.md          # 개발 로드맵
└── CLAUDE.md           # 이 파일 (개발 진행사항)
```

## 🎯 핵심 기능 목록

### 현재 구현된 기능
- [x] Electron 앱 기본 구조
- [x] Windows 알림 시스템
- [x] 약물 정보 입력 (이름, 용량, 복용시간)
- [x] 약물 목록 표시 및 개수 카운트
- [x] 약물 삭제 기능
- [x] 데이터 영속성 (localStorage)
- [x] 글래스모피즘 UI 디자인

### 다음에 구현할 기능
- [ ] 시간 기반 자동 알림
- [ ] 알림 스케줄링
- [ ] 복용 완료 체크
- [ ] 더 나은 UI/UX

## 💊 약물 관리 데이터 구조

```javascript
{
  id: 1672934400000,           // 타임스탬프 기반 고유 ID
  name: "아모잘탄",             // 약물 이름
  dosage: "5mg",               // 용량
  time: "08:00",               // 복용 시간
  notes: "",                   // 추가 메모
  created_at: "2024-01-15T08:00:00.000Z"  // 생성 시간
}
```

## 🚀 실행 방법

### 개발 환경에서 실행
```bash
cd C:\Users\ohjih\wonik-health-planning
npm start
```

### 새로운 패키지 설치 시
```bash
npm install [패키지명]
```

### 문제 해결
- **SQLite 오류 시:** `npm rebuild better-sqlite3`
- **모듈 충돌 시:** `npm install` 재실행
- **캐시 문제 시:** `npm cache clean --force`

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary Gradient:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Success Color:** `#4ade80` (약물 추가 성공)
- **Danger Color:** `#ef4444` (삭제 버튼)
- **Glass Effect:** `rgba(255, 255, 255, 0.15)` + `backdrop-filter: blur(15px)`

### UI 컴포넌트
- **약물 추가 폼:** 글래스모피즘 카드
- **약물 목록:** 투명 배경 + 블러 효과
- **버튼:** 그라데이션 + 호버 애니메이션
- **알림:** Windows 네이티브 스타일

## 🐛 알려진 이슈 및 해결책

### 1. SQLite 호환성 문제
**문제:** Node.js 버전과 SQLite 모듈 호환성
**해결:** localStorage로 대체 구현
**상태:** 해결완료 ✅

### 2. 개발자 도구 자동 열림
**문제:** 앱 실행 시 개발자 도구가 자동으로 열림
**해결:** `mainWindow.webContents.openDevTools()` 라인 제거
**상태:** 필요시 해결 예정

### 3. 앱 아이콘 누락
**문제:** 윈도우 타이틀바에 기본 아이콘 표시
**해결:** assets/icon.png 파일 추가 필요
**상태:** 나중에 해결 예정

## 📝 개발 노트

### 학습한 내용
1. **Electron 기본 구조** - 메인 프로세스와 렌더러 프로세스 구분
2. **localStorage 활용** - 클라이언트 사이드 데이터 저장
3. **Windows 알림 API** - Notification 객체 사용법
4. **CSS 글래스모피즘** - backdrop-filter와 투명도 조합
5. **JavaScript 이벤트 처리** - DOM 조작과 사용자 상호작용

### 개발 팁
- **단계별 테스트**: 각 기능을 작은 단위로 나누어 테스트
- **콘솔 로그 활용**: 디버깅을 위한 상세한 로그 메시지
- **사용자 피드백**: alert()를 통한 즉각적인 작업 결과 표시
- **에러 처리**: try-catch 구문으로 안정적인 에러 핸들링

## 🎯 다음 단계 (Phase 3 준비사항)

### 필요한 기능
1. **타이머 시스템** - setInterval 또는 setTimeout 활용
2. **시간 계산** - 현재 시간과 설정 시간 비교
3. **백그라운드 실행** - 앱이 최소화되어도 알림 작동
4. **알림 관리** - 여러 약물의 서로 다른 알림 시간 처리

### 예상 구현 방법
```javascript
// 의사코드
function scheduleNotification(medication) {
  const now = new Date();
  const scheduleTime = new Date(medication.time);
  const timeDiff = scheduleTime - now;
  
  if (timeDiff > 0) {
    setTimeout(() => {
      showMedicationNotification(medication);
    }, timeDiff);
  }
}
```

## 🏢 원익IPS 특화 고려사항

### 사용자 환경
- **Windows 10/11** 주 사용 환경
- **사무직 직원** 주 대상 사용자
- **업무 중 사용** - 방해받지 않는 알림 필요

### 회사 정책 고려
- **보안 정책** - 외부 네트워크 연결 최소화
- **설치 정책** - IT팀 승인 후 배포
- **사용성** - 직관적이고 간단한 인터페이스 필수

## 📊 성공 지표

### Phase 별 완료 기준
- **Phase 0:** Hello World 앱 실행 ✅
- **Phase 1:** 알림 버튼 클릭 시 Windows 알림 표시 ✅
- **Phase 2:** 약물 추가/삭제/목록 표시 ✅
- **Phase 3:** 설정 시간에 자동 알림 (다음 목표)
- **Phase 4:** 예쁜 UI + 사용성 개선
- **Phase 5:** .exe 파일 배포

### 최종 목표
- 원익IPS SW팀 20명 파일럿 테스트
- 사용자 만족도 75% 이상
- 일일 사용률 80% 이상
- 약물 복용 순응도 개선 효과 확인

---

**마지막 업데이트:** 2024년 8월 3일  
**현재 상태:** Phase 2 완료, Phase 3 준비 중  
**다음 작업:** 시간 기반 자동 알림 시스템 구현