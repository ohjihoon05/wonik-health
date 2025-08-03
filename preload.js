const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API를 HTML에서 사용할 수 있도록 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 약물 관련 API
  addMedication: (medicationData) => ipcRenderer.invoke('add-medication', medicationData),
  getMedications: () => ipcRenderer.invoke('get-medications'),
  deleteMedication: (id) => ipcRenderer.invoke('delete-medication', id),
  getMedicationCount: () => ipcRenderer.invoke('get-medication-count'),
  
  // 알림 관련 API (나중을 위해 미리 준비)
  showNotification: (title, body) => {
    new Notification(title, { body });
  }
});

console.log('🔗 Preload script가 로드되었습니다!');