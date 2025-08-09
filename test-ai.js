// AI 추천 서비스 테스트 스크립트
const AIRecommendationService = require('./ai-recommendations');

async function testAI() {
    const aiService = new AIRecommendationService();
    
    console.log('🧪 AI 추천 서비스 테스트 시작...\n');
    
    // 1. Ollama 상태 확인
    console.log('1️⃣ Ollama 서버 상태 확인...');
    const isAvailable = await aiService.checkOllamaStatus();
    console.log(`   Ollama 상태: ${isAvailable ? '✅ 연결됨' : '❌ 연결 실패'}\n`);
    
    if (!isAvailable) {
        console.log('⚠️ Ollama가 실행 중인지 확인하세요: ollama serve');
        return;
    }
    
    // 2. 사용 가능한 모델 확인
    console.log('2️⃣ 사용 가능한 모델 목록...');
    const models = await aiService.getAvailableModels();
    if (models.length > 0) {
        models.forEach(model => {
            console.log(`   - ${model.name} (${model.details?.parameter_size || 'Unknown size'})`);
        });
    } else {
        console.log('   모델이 없습니다.');
    }
    console.log('');
    
    // 3. AI 추천 테스트
    console.log('3️⃣ AI 추천 생성 테스트...');
    const diseases = ['편두통', '목디스크', '당뇨병'];
    
    for (const disease of diseases) {
        console.log(`\n   📋 ${disease} 추천 생성 중...`);
        try {
            const startTime = Date.now();
            const recommendation = await aiService.getRecommendation(disease, 'gemma3:1b');
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            
            console.log(`   ✅ 완료 (${elapsed}초)`);
            console.log(`   패턴: ${recommendation.pattern}`);
            console.log(`   스케줄: ${recommendation.schedule}`);
            console.log(`   팁 개수: ${recommendation.tips.length}개`);
            
            if (recommendation.tips.length > 0) {
                console.log(`   첫 번째 팁: ${recommendation.tips[0]}`);
            }
        } catch (error) {
            console.log(`   ❌ 오류: ${error.message}`);
        }
    }
    
    console.log('\n✨ 테스트 완료!');
}

// 테스트 실행
testAI().catch(console.error);