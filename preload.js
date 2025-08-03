const { contextBridge } = require('electron');

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
  
  // localStorage는 웹 표준이므로 직접 사용 가능
  // 추가 보안 계층이 필요한 경우에만 래퍼 생성
});

// CSP 위반 감지
window.addEventListener('securitypolicyviolation', (event) => {
  console.error('🔒 CSP 위반 감지:', event.violatedDirective, event.blockedURI);
});

console.log('🔗 보안 강화된 Preload script가 로드되었습니다!');