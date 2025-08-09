const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API만 HTML에서 사용할 수 있도록 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 앱 정보
  appVersion: '1.0.0',
  platform: process.platform,
  
  // 알림 API - 안전한 래퍼
  showNotification: (title, body, options = {}) => {
    if (typeof title === 'string' && typeof body === 'string') {
      return new Notification(title, {
        body: body,
        icon: options.icon || '',
        silent: options.silent || false,
        requireInteraction: options.requireInteraction || false
      });
    }
    throw new Error('Invalid notification parameters');
  },
  
  // 브라우저 환경 체크
  isElectron: true,
  
  // AI 추천 API
  getAIRecommendation: async (diseaseName, modelName) => {
    return await ipcRenderer.invoke('get-ai-recommendation', diseaseName, modelName);
  },
  
  // Ollama 모델 목록 가져오기
  getOllamaModels: async () => {
    return await ipcRenderer.invoke('get-ollama-models');
  },
  
  // Ollama 상태 확인
  checkOllamaStatus: async () => {
    return await ipcRenderer.invoke('check-ollama-status');
  },
  
  // localStorage는 웹 표준이므로 직접 사용 가능
  // 추가 보안 계층이 필요한 경우에만 래퍼 생성
});

// CSP 위반 감지
window.addEventListener('securitypolicyviolation', (event) => {
  console.error('🔒 CSP 위반 감지:', event.violatedDirective, event.blockedURI);
});

console.log('🔗 보안 강화된 Preload script가 로드되었습니다!');