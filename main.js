const { app, BrowserWindow } = require('electron');
const path = require('path');

// 메인 윈도우 생성 함수
function createWindow() {
  // 브라우저 윈도우 생성
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'), // 아이콘 (나중에 추가)
    title: 'Wonik Health - 건강한 직장생활의 시작'
  });

  // HTML 파일 로드
  mainWindow.loadFile('index.html');

  // 개발자 도구 열기 (개발 중에만)
  mainWindow.webContents.openDevTools();
}

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