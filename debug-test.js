// 디버깅용 테스트 스크립트 - Electron 앱의 렌더러 프로세스에서 실행
// 개발자 도구 콘솔에서 이 코드를 붙여넣어서 실행하세요.

console.log('🔧 디버깅 테스트 시작...');

// 1. 질병 추가 시뮬레이션
function testAddDisease() {
    console.log('1. 질병 추가 테스트...');
    
    const diseaseInput = document.getElementById('disease-search-input');
    const addBtn = document.getElementById('add-disease-btn');
    
    if (!diseaseInput || !addBtn) {
        console.error('❌ 질병 추가 요소를 찾을 수 없습니다!');
        return;
    }
    
    // 발기부전 입력
    diseaseInput.value = '발기부전';
    console.log('✅ 입력 필드에 "발기부전" 입력됨');
    
    // 추가 버튼 클릭
    addBtn.click();
    console.log('✅ 추가 버튼 클릭됨');
}

// 2. 생성된 버튼 클릭 시뮬레이션
function testClickDiseaseButton() {
    console.log('2. 질병 버튼 클릭 테스트...');
    
    // 커스텀 질병 목록에서 첫 번째 버튼 찾기
    const customButtons = document.querySelectorAll('#custom-disease-list .disease-btn');
    
    if (customButtons.length === 0) {
        console.error('❌ 커스텀 질병 버튼이 없습니다!');
        return;
    }
    
    const firstButton = customButtons[0];
    console.log(`✅ 찾은 버튼: ${firstButton.textContent}`);
    
    // 버튼 클릭
    firstButton.click();
    console.log('✅ 질병 버튼 클릭됨');
}

// 3. 전체 테스트 실행
function runFullTest() {
    console.log('🚀 전체 테스트 시작...');
    
    // 1단계: 질병 추가
    testAddDisease();
    
    // 2단계: 2초 후 버튼 클릭 (DOM 업데이트 대기)
    setTimeout(() => {
        testClickDiseaseButton();
    }, 2000);
}

// 실행
runFullTest();

console.log('🔧 디버깅 테스트 스크립트 로드 완료!');
console.log('만약 테스트가 실행되지 않으면 runFullTest() 함수를 직접 호출하세요.');