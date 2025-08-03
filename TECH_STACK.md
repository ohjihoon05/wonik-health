# 🔧 기술 스택 및 아키텍처 설계

## 📋 전체 아키텍처 개요

```
┌─────────────────────────────────────────┐
│                UI Layer                 │
│  React + TypeScript + Ant Design       │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│              Business Logic             │
│   Redux Toolkit + Custom Hooks         │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│              Service Layer              │
│    API Services + Notification         │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│               Data Layer                │
│        SQLite + Local Storage          │
└─────────────────────────────────────────┘
```

## 🖥️ Frontend 기술 스택

### Core Framework
```json
{
  "electron": "^28.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0"
}
```

### UI/UX
```json
{
  "antd": "^5.12.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "framer-motion": "^10.16.0",
  "react-spring": "^9.7.0"
}
```

### 상태 관리
```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "redux-persist": "^6.0.0"
}
```

### 차트 및 시각화
```json
{
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "recharts": "^2.8.0"
}
```

## 🛠️ Backend & Data

### 로컬 데이터베이스
```json
{
  "better-sqlite3": "^9.0.0",
  "typeorm": "^0.3.0"
}
```

### AI/ML 라이브러리
```json
{
  "@tensorflow/tfjs": "^4.15.0",
  "@tensorflow/tfjs-node": "^4.15.0",
  "ml-regression": "^2.0.0"
}
```

### 알림 시스템
```json
{
  "node-notifier": "^10.0.0",
  "electron-notifications": "^1.0.0"
}
```

## 🏗️ 상세 아키텍처 설계

### 1. 프로젝트 구조
```
wonik-health/
├── electron/                 # Electron 메인 프로세스
│   ├── main.ts              # 앱 진입점
│   ├── preload.ts           # 렌더러-메인 통신
│   └── utils/               # 유틸리티
├── src/                     # React 애플리케이션
│   ├── components/          # 재사용 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   ├── health/         # 건강 관련 컴포넌트
│   │   └── schedule/       # 스케줄 관련 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Dashboard/      # 대시보드
│   │   ├── Profile/        # 건강 프로필
│   │   ├── Schedule/       # 스케줄러
│   │   ├── Medicine/       # 약물 관리
│   │   └── Analytics/      # 분석
│   ├── store/              # Redux 스토어
│   │   ├── slices/         # 기능별 슬라이스
│   │   └── middleware/     # 커스텀 미들웨어
│   ├── services/           # API 서비스
│   │   ├── database/       # DB 서비스
│   │   ├── notification/   # 알림 서비스
│   │   └── ai/            # AI 분석 서비스
│   ├── hooks/              # 커스텀 훅
│   ├── utils/              # 유틸리티
│   └── types/              # TypeScript 타입
├── database/               # 데이터베이스 스키마
├── assets/                 # 정적 리소스
└── dist/                   # 빌드 결과물
```

### 2. 데이터베이스 스키마

#### 사용자 프로필 (users)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 질병 정보 (diseases)
```sql
CREATE TABLE diseases (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  disease_type TEXT NOT NULL, -- 'migraine', 'diabetes', 'disc'
  severity_level INTEGER DEFAULT 1, -- 1-5 scale
  diagnosed_date DATE,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 약물 정보 (medications)
```sql
CREATE TABLE medications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT, -- 'daily', 'twice_daily', 'as_needed'
  times TEXT, -- JSON array of times
  food_relation TEXT, -- 'before_meal', 'after_meal', 'empty_stomach'
  stock_count INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 7,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 복용 기록 (medication_logs)
```sql
CREATE TABLE medication_logs (
  id INTEGER PRIMARY KEY,
  medication_id INTEGER,
  scheduled_time DATETIME,
  actual_time DATETIME,
  status TEXT, -- 'taken', 'missed', 'delayed'
  notes TEXT,
  FOREIGN KEY (medication_id) REFERENCES medications(id)
);
```

#### 건강 상태 기록 (health_logs)
```sql
CREATE TABLE health_logs (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  date DATE,
  symptom_level INTEGER, -- 1-10 scale
  mood_level INTEGER, -- 1-10 scale
  energy_level INTEGER, -- 1-10 scale
  sleep_quality INTEGER, -- 1-10 scale
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 업무 스케줄 (work_schedules)
```sql
CREATE TABLE work_schedules (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  date DATE,
  start_time TIME,
  end_time TIME,
  task_type TEXT,
  intensity_level INTEGER, -- 1-5 scale
  completed BOOLEAN DEFAULT FALSE,
  health_impact TEXT, -- 질병에 미친 영향
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. 핵심 서비스 구조

#### 알림 서비스 (NotificationService)
```typescript
class NotificationService {
  // 약물 복용 알림
  scheduleMedicationReminder(medication: Medication): void
  
  // 건강 체크 알림
  scheduleHealthCheckReminder(): void
  
  // 휴식 알림
  scheduleBreakReminder(workType: string): void
  
  // 스트레칭 알림
  scheduleStretchReminder(diseaseType: string): void
}
```

#### AI 분석 서비스 (AnalyticsService)
```typescript
class AnalyticsService {
  // 개인 패턴 분석
  analyzePersonalPattern(userId: number): PersonalPattern
  
  // 최적 업무시간 예측
  predictOptimalWorkTime(diseaseType: string): TimeSlot[]
  
  // 건강 상태 예측
  predictHealthStatus(healthLogs: HealthLog[]): HealthPrediction
}
```

#### 스케줄링 서비스 (SchedulingService)
```typescript
class SchedulingService {
  // 질병별 맞춤 스케줄 생성
  generateHealthAwareSchedule(
    diseaseType: string, 
    workTasks: Task[]
  ): Schedule
  
  // 약물 복용 시간 최적화
  optimizeMedicationSchedule(
    medications: Medication[]
  ): OptimizedSchedule
}
```

## 🔧 개발 환경 설정

### 필수 도구
- **Node.js**: v18.0.0 이상
- **npm**: v9.0.0 이상
- **Git**: 버전 관리
- **VSCode**: 권장 에디터

### 개발 스크립트
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:electron\" \"npm run dev:react\"",
    "dev:react": "vite",
    "dev:electron": "electron electron/main.ts",
    "build": "npm run build:react && npm run build:electron",
    "build:react": "vite build",
    "build:electron": "electron-builder",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### 빌드 설정 (electron-builder)
```json
{
  "build": {
    "appId": "com.wonik.health",
    "productName": "Wonik Health",
    "directories": {
      "output": "dist"
    },
    "files": [
      "build/**/*",
      "electron/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

## 🚀 성능 최적화 전략

### 1. 메모리 최적화
- Redux 상태 정규화
- 메모이제이션 활용 (React.memo, useMemo)
- 가상화 (react-window) 적용
- 이미지 지연 로딩

### 2. 배터리 최적화
- 백그라운드 작업 최소화
- 알림 배치 처리
- CPU 집약적 작업 최적화
- 절전 모드 지원

### 3. 데이터베이스 최적화
- 인덱스 최적화
- 쿼리 최적화
- 데이터 압축
- 정기적 정리 작업

## 🔒 보안 고려사항

### 데이터 보안
- 민감한 건강 정보 암호화
- 로컬 저장소 보안
- 개인정보 최소 수집 원칙

### 애플리케이션 보안
- Electron 보안 모범 사례 적용
- 코드 서명 인증서 적용
- 자동 업데이트 보안

## 📊 모니터링 및 로깅

### 사용자 행동 분석
- 익명화된 사용 패턴 수집
- 앱 성능 지표 모니터링
- 오류 로그 수집 및 분석

### 개발자 도구
- 디버깅 도구 내장
- 로그 레벨 설정
- 성능 프로파일링