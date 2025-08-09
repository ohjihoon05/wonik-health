const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const AIRecommendationService = require('./ai-recommendations');

// 메인 윈도우 생성 함수
function createWindow() {
  // 브라우저 윈도우 생성
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,        // 보안 강화: Node.js 통합 비활성화
      contextIsolation: true,        // 보안 강화: 컨텍스트 격리 활성화
      enableRemoteModule: false,     // 보안 강화: 원격 모듈 비활성화
      preload: path.join(__dirname, 'preload.js'), // preload 스크립트 사용
      webSecurity: true              // 웹 보안 활성화
    },
    title: 'Wonik Health - 건강한 직장생활의 시작',
    show: false,                     // 로딩 완료 후 표시
    backgroundColor: '#ffffff'       // 로딩 중 배경색
  });

  // HTML 파일 로드
  mainWindow.loadFile('index.html');

  // 윈도우 로딩 완료 후 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 프로덕션에서는 개발자 도구 비활성화
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// AI 추천 서비스 인스턴스
const aiService = new AIRecommendationService();

// IPC 핸들러 설정
ipcMain.handle('get-ai-recommendation', async (event, diseaseName, modelName) => {
  try {
    console.log(`🤖 AI 추천 요청: ${diseaseName} (모델: ${modelName || '기본값'})`);
    const recommendation = await aiService.getRecommendation(diseaseName, modelName);
    console.log('✅ AI 추천 완료:', recommendation);
    return { success: true, data: recommendation };
  } catch (error) {
    console.error('❌ AI 추천 오류:', error);
    return { success: false, error: error.message };
  }
});

// Ollama 모델 목록 가져오기
ipcMain.handle('get-ollama-models', async () => {
  try {
    const models = await aiService.getAvailableModels();
    return { success: true, models: models };
  } catch (error) {
    console.error('❌ 모델 목록 조회 오류:', error);
    return { success: false, models: [] };
  }
});

// Ollama 상태 확인
ipcMain.handle('check-ollama-status', async () => {
  try {
    const isAvailable = await aiService.checkOllamaStatus();
    return { success: true, available: isAvailable };
  } catch (error) {
    return { success: false, available: false };
  }
});

// 앱이 준비되면 윈도우 생성
app.whenReady().then(() => {
  createWindow();

  // macOS에서 독 아이콘 클릭 시 윈도우 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('🏥 Wonik Health 앱이 시작되었습니다!');