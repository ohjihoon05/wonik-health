// AI 기반 질병별 업무 패턴 추천 시스템
const { net } = require('electron');
const https = require('https');
const http = require('http');

class AIRecommendationService {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434';
        this.model = 'gemma3:1b'; // 더 빠른 작은 모델 사용
    }

    // Ollama API 호출
    async callOllama(prompt, modelName) {
        return new Promise((resolve, reject) => {
            console.log(`🔧 Ollama API 호출: ${this.ollamaUrl}/api/generate`);
            console.log(`📝 사용 모델: ${modelName}`);
            
            const postData = JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false
            });
            
            const options = {
                hostname: '127.0.0.1',
                port: 11434,
                path: '/api/generate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        console.log('✅ Ollama 응답 수신 완료');
                        resolve(parsed.response);
                    } catch (error) {
                        console.error('JSON 파싱 오류:', error);
                        reject(error);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('Ollama API 호출 실패:', error);
                reject(error);
            });
            
            // 40초 타임아웃 설정 (Ollama가 느릴 수 있음)
            req.setTimeout(40000, () => {
                req.destroy();
                reject(new Error('Ollama 응답 시간 초과 (40초)'));
            });
            
            req.write(postData);
            req.end();
        });
    }

    // 사용 가능한 모델 목록 가져오기
    async getAvailableModels() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: '127.0.0.1',
                port: 11434,
                path: '/api/tags',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed.models || []);
                    } catch (error) {
                        console.error('모델 목록 파싱 오류:', error);
                        resolve([]);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('모델 목록 조회 오류:', error);
                resolve([]);
            });
            
            req.end();
        });
    }

    // 질병별 맞춤 권장사항 생성
    async getRecommendation(diseaseName, modelName) {
        // 모델명이 제공되면 사용, 아니면 기본값
        const useModel = modelName || this.model;
        const prompt = `You are a health advisor. For a patient with ${diseaseName}, provide ONLY:
1. Work pattern: [number] minutes work, [number] minutes rest
2. Three tips in bullet points

Format example:
Work pattern: 45 minutes work, 15 minutes rest
Tips:
- Drink water regularly
- Take breaks
- Stretch often

Be brief. No disclaimers.`;

        try {
            console.log(`🤖 AI 모델 ${useModel}로 추천 생성 중...`);
            const response = await this.callOllama(prompt, useModel);
            return this.parseAIResponse(response, diseaseName);
        } catch (error) {
            console.error('AI 추천 생성 실패:', error);
            return this.getOfflineRecommendation(diseaseName);
        }
    }

    // AI 응답 파싱
    parseAIResponse(response, diseaseName) {
        // 기본 구조
        let recommendation = {
            disease: diseaseName,
            pattern: '',
            schedule: '',
            tips: [],
            generated: new Date().toISOString()
        };

        try {
            console.log('AI 응답 파싱 시작...');
            
            // 1. Work/Rest 패턴 찾기 - 더 개선된 정규식
            // 예: "45 minutes work followed by 15 minutes rest"
            // 예: "90 minutes of focused work with 10-minute breaks"
            const patterns = [
                /(\d+)\s*(?:minutes?|mins?|분)\s*(?:of\s+)?(?:focused\s+)?(?:work|업무).*?(\d+)[\s\-]*(?:minutes?|mins?|분)\s*(?:of\s+)?(?:rest|break|휴식)/gi,
                /(\d+)[\s\-]?(?:min|분).*?(?:work|업무).*?(\d+)[\s\-]?(?:min|분).*?(?:rest|break|휴식)/gi,
                /work.*?(\d+)\s*(?:minutes?|mins?).*?rest.*?(\d+)\s*(?:minutes?|mins?)/gi
            ];
            
            for (const pattern of patterns) {
                const match = response.match(pattern);
                if (match && match[0]) {
                    // 숫자 추출
                    const numbers = match[0].match(/\d+/g);
                    if (numbers && numbers.length >= 2) {
                        recommendation.pattern = `${numbers[0]}분 업무 → ${numbers[1]}분 휴식`;
                        break;
                    }
                }
            }
            
            // 2. 스케줄 관련 정보 찾기
            const scheduleKeywords = ['morning', 'afternoon', 'evening', 'lunch', '오전', '오후', '점심'];
            const scheduleLines = response.split('\n').filter(line => 
                scheduleKeywords.some(keyword => line.toLowerCase().includes(keyword))
            );
            
            if (scheduleLines.length > 0) {
                // 가장 관련성 높은 라인 선택
                const relevantLine = scheduleLines.find(line => 
                    line.includes('AM') || line.includes('PM') || line.includes('시')
                ) || scheduleLines[0];
                
                if (relevantLine.includes('Morning') || relevantLine.includes('Afternoon')) {
                    recommendation.schedule = '오전 집중 업무, 오후 가벼운 업무';
                } else if (relevantLine.includes('Lunch')) {
                    recommendation.schedule = '식사 시간 엄격히 준수';
                }
            }
            
            // 3. 팁 추출 - 개선된 로직
            const tipPatterns = [
                /^\s*\*\s*\*\*([^:]+):\*\*\s*(.+)$/gm,  // **Title:** Content
                /^\s*\*\s+([^:]+):\s*(.+)$/gm,          // * Title: Content
                /^\s*\d+\.\s*(.+)$/gm,                  // 1. Content
                /^\s*[-•]\s*(.+)$/gm                    // - Content or • Content
            ];
            
            const extractedTips = [];
            
            // 먼저 굵은 글씨 팁 찾기
            const boldTips = response.match(/\*\*([^:*]+):\*\*\s*([^*\n]+)/g);
            if (boldTips) {
                boldTips.forEach(tip => {
                    const cleaned = tip.replace(/\*\*/g, '').trim();
                    if (cleaned.length > 10 && !cleaned.includes('Work/Rest') && !cleaned.includes('Pattern')) {
                        extractedTips.push(cleaned);
                    }
                });
            }
            
            // 일반 팁 찾기
            const lines = response.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                // 팁으로 보이는 라인
                if (trimmed.match(/^[*\-•]\s+\w+/) && trimmed.length > 20) {
                    const tip = trimmed.replace(/^[*\-•]\s+/, '').trim();
                    if (!tip.includes('Work/Rest') && !tip.includes('Pattern') && 
                        !extractedTips.some(t => t.includes(tip.substring(0, 20)))) {
                        extractedTips.push(tip);
                    }
                }
            });
            
            // 최대 4개 팁만 선택
            if (extractedTips.length > 0) {
                recommendation.tips = extractedTips.slice(0, 4);
            }
            
            // 4. 필수 정보가 없으면 기본값 사용
            const defaultRec = this.getOfflineRecommendation(diseaseName);
            
            if (!recommendation.pattern) {
                console.log('패턴을 찾지 못해 기본값 사용');
                recommendation.pattern = defaultRec.pattern;
            }
            
            if (!recommendation.schedule) {
                recommendation.schedule = defaultRec.schedule;
            }
            
            if (recommendation.tips.length === 0) {
                console.log('팁을 찾지 못해 기본값 사용');
                recommendation.tips = defaultRec.tips;
            }
            
            console.log('파싱 완료:', {
                pattern: recommendation.pattern,
                schedule: recommendation.schedule,
                tipCount: recommendation.tips.length
            });

        } catch (error) {
            console.error('AI 응답 파싱 오류:', error);
            recommendation = this.getOfflineRecommendation(diseaseName);
        }

        return recommendation;
    }

    // 오프라인 기본 권장사항
    getOfflineRecommendation(diseaseName) {
        const recommendations = {
            '편두통': {
                disease: '편두통',
                pattern: '45분 업무 → 15분 휴식',
                schedule: '오전 집중 업무, 오후 가벼운 업무',
                tips: [
                    '화면 밝기를 낮추고 블루라이트 차단',
                    '규칙적인 수분 섭취와 간식',
                    '조용하고 어두운 환경 유지',
                    '스트레스 유발 업무는 오전에 처리'
                ]
            },
            '목디스크': {
                disease: '목디스크',
                pattern: '30분 업무 → 5분 스트레칭',
                schedule: '1시간마다 자세 변경 필수',
                tips: [
                    '모니터 높이를 눈높이에 맞춤',
                    '목과 어깨 스트레칭 필수',
                    '인체공학적 의자와 쿠션 사용',
                    '전화통화 시 헤드셋 사용'
                ]
            },
            '허리디스크': {
                disease: '허리디스크',
                pattern: '40분 업무 → 10분 기립/걷기',
                schedule: '앉기/서기 교대 근무',
                tips: [
                    '높이 조절 책상 사용 권장',
                    '허리 받침대 필수 사용',
                    '무거운 물건 들기 금지',
                    '코어 근육 강화 운동'
                ]
            },
            '당뇨병': {
                disease: '당뇨병',
                pattern: '50분 업무 → 10분 활동',
                schedule: '식사 시간 엄격히 준수',
                tips: [
                    '규칙적인 식사와 간식 시간',
                    '혈당 체크 알림 설정',
                    '스트레스 관리 명상/호흡',
                    '당뇨 응급키트 항상 준비'
                ]
            },
            '고혈압': {
                disease: '고혈압',
                pattern: '55분 업무 → 5분 휴식',
                schedule: '스트레스 높은 업무 분산',
                tips: [
                    '카페인 섭취 제한',
                    '규칙적인 심호흡 운동',
                    '짠 음식 피하기',
                    '혈압 측정 정기 체크'
                ]
            },
            '안구건조증': {
                disease: '안구건조증',
                pattern: '20분 화면 → 20초 먼 곳 보기',
                schedule: '20-20-20 규칙 준수',
                tips: [
                    '인공눈물 정기 점안',
                    '실내 습도 40-60% 유지',
                    '화면 거리 60cm 이상',
                    '눈 깜빡임 의식적으로 하기'
                ]
            },
            '관절염': {
                disease: '관절염',
                pattern: '45분 업무 → 10분 관절 운동',
                schedule: '오전 워밍업 후 업무 시작',
                tips: [
                    '관절 보호대 착용',
                    '따뜻한 환경 유지',
                    '반복 동작 최소화',
                    '인체공학적 도구 사용'
                ]
            },
            'default': {
                disease: '일반',
                pattern: '50분 업무 → 10분 휴식',
                schedule: '규칙적인 업무 패턴 유지',
                tips: [
                    '충분한 수분 섭취',
                    '규칙적인 스트레칭',
                    '적절한 실내 온도 유지',
                    '스트레스 관리 필수'
                ]
            }
        };

        // 질병명 정규화 (공백 제거, 소문자 변환)
        const normalizedDisease = diseaseName.replace(/\s/g, '').toLowerCase();
        
        // 매칭되는 권장사항 찾기
        for (const [key, value] of Object.entries(recommendations)) {
            if (normalizedDisease.includes(key.replace(/\s/g, '').toLowerCase()) || 
                key.replace(/\s/g, '').toLowerCase().includes(normalizedDisease)) {
                return { ...value, generated: new Date().toISOString() };
            }
        }

        // 기본값 반환
        return { 
            ...recommendations.default, 
            disease: diseaseName,
            generated: new Date().toISOString() 
        };
    }

    // 약물 정보 조회
    async getMedicationInfo(medicationName, modelName) {
        const useModel = modelName || this.model;
        const prompt = `You are a medical information assistant. For the medication "${medicationName}", provide:

1. 약물 종류: [약물 분류]
2. 주요 효능: [간단한 효능]
3. 복용법: [복용 시간과 방법]
4. 주의사항: [중요 주의점 2-3개]
5. 부작용: [흔한 부작용 2-3개]

Answer in Korean. Be accurate and concise.`;

        try {
            console.log(`🏥 AI 약물 정보 조회 중: ${medicationName}`);
            const response = await this.callOllama(prompt, useModel);
            return this.parseMedicationInfo(response, medicationName);
        } catch (error) {
            console.error('AI 약물 정보 조회 실패:', error);
            return this.getOfflineMedicationInfo(medicationName);
        }
    }

    // AI 약물 정보 파싱
    parseMedicationInfo(response, medicationName) {
        let medicationInfo = {
            name: medicationName,
            category: '',
            effects: '',
            usage: '',
            warnings: [],
            sideEffects: [],
            generated: new Date().toISOString()
        };

        try {
            console.log('약물 정보 파싱 시작...');

            const lines = response.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                const trimmed = line.trim();
                
                // 약물 종류
                if (trimmed.includes('약물 종류') || trimmed.includes('분류')) {
                    medicationInfo.category = trimmed.split(':')[1]?.trim() || '의약품';
                }
                
                // 주요 효능
                if (trimmed.includes('주요 효능') || trimmed.includes('효능')) {
                    medicationInfo.effects = trimmed.split(':')[1]?.trim() || '';
                }
                
                // 복용법
                if (trimmed.includes('복용법') || trimmed.includes('복용')) {
                    medicationInfo.usage = trimmed.split(':')[1]?.trim() || '';
                }
                
                // 주의사항
                if (trimmed.includes('주의사항') || trimmed.includes('주의')) {
                    const warningText = trimmed.split(':')[1]?.trim();
                    if (warningText) {
                        medicationInfo.warnings.push(warningText);
                    }
                }
                
                // 부작용
                if (trimmed.includes('부작용')) {
                    const sideEffectText = trimmed.split(':')[1]?.trim();
                    if (sideEffectText) {
                        medicationInfo.sideEffects.push(sideEffectText);
                    }
                }
                
                // 추가 주의사항이나 부작용을 bullet point로 찾기
                if (trimmed.match(/^[-•*]\s+/)) {
                    const item = trimmed.replace(/^[-•*]\s+/, '').trim();
                    if (item.length > 5) {
                        if (medicationInfo.warnings.length < 3) {
                            medicationInfo.warnings.push(item);
                        } else if (medicationInfo.sideEffects.length < 3) {
                            medicationInfo.sideEffects.push(item);
                        }
                    }
                }
            }

            // 기본값이 없으면 오프라인 정보 사용
            const defaultInfo = this.getOfflineMedicationInfo(medicationName);
            
            if (!medicationInfo.category) medicationInfo.category = defaultInfo.category;
            if (!medicationInfo.effects) medicationInfo.effects = defaultInfo.effects;
            if (!medicationInfo.usage) medicationInfo.usage = defaultInfo.usage;
            if (medicationInfo.warnings.length === 0) medicationInfo.warnings = defaultInfo.warnings;
            if (medicationInfo.sideEffects.length === 0) medicationInfo.sideEffects = defaultInfo.sideEffects;

            console.log('약물 정보 파싱 완료:', medicationInfo.name);

        } catch (error) {
            console.error('약물 정보 파싱 오류:', error);
            medicationInfo = this.getOfflineMedicationInfo(medicationName);
        }

        return medicationInfo;
    }

    // 오프라인 약물 정보 (RxNorm 표준 기반)
    getOfflineMedicationInfo(medicationName) {
        const knownMedications = {
            '타이레놀': {
                name: '타이레놀 (Acetaminophen)',
                rxcui: 'RXCUI:161', // RxNorm 표준 코드
                category: '해열진통제 (Analgesic/Antipyretic)',
                effects: '발열, 두통, 관절통, 근육통 완화 - FDA 승인 적응증',
                usage: '성인: 1회 325-650mg, 4-6시간마다, 최대 3000mg/일 (RxNorm 표준)',
                warnings: ['간 질환자 주의 (FDA 경고)', '알코올과 함께 복용 금지', '1일 4000mg 초과 금지 (간독성 위험)', 'CYP2E1 효소 상호작용 주의'],
                sideEffects: ['메스꺼움', '간 손상 위험 (과량 복용 시)', '알레르기 반응', '혈소판 감소 (드문 경우)'],
                ndc: ['00093-0104-01', '00093-0104-10'], // National Drug Code 예시
                brandNames: ['Tylenol', 'Panadol', 'Acetaminophen']
            },
            '아스피린': {
                name: '아스피린 (Aspirin)',
                rxcui: 'RXCUI:1191', // RxNorm 표준 코드
                category: '해열진통소염제 (NSAID)',
                effects: '해열, 진통, 항염, 혈전 예방 - FDA 승인 심혈관 보호 효과',
                usage: '진통: 성인 325-650mg, 4시간마다 / 심혈관 예방: 81mg/일 (RxNorm 표준)',
                warnings: ['위궤양 환자 금기 (FDA 블랙박스 경고)', '출혈 위험 증가', '18세 미만 사용 금지 (Reye 증후군)', '수술 전 7일 중단'],
                sideEffects: ['위장 장애', '출혈', '이명', '알레르기 반응'],
                ndc: ['00904-2009-60', '00904-2009-80'],
                brandNames: ['Aspirin', 'Bayer', 'Bufferin']
            },
            '게보린': {
                name: '게보린 (복합 진통제)',
                rxcui: 'RXCUI:Complex', 
                category: '복합 진통제 (Combination Analgesic)',
                effects: '두통, 치통, 생리통, 근육통 완화 - 아세트아미노펜+이부프로펜+카페인 복합',
                usage: '성인 1회 1-2정, 1일 3-4회, 최대 6정/일',
                warnings: ['카페인 132mg 함유로 과량 복용 주의', '임산부 사용 금지', '위장 장애 시 주의', '간질환자 주의'],
                sideEffects: ['위장 불편', '불면', '신경과민', '심계항진'],
                ndc: ['Korean-Pharma-Code'],
                brandNames: ['게보린', 'Gebolin']
            },
            '펜잘': {
                name: '펜잘 (복합 감기약)',
                rxcui: 'RXCUI:Complex-Cold',
                category: '복합 감기약 (Multi-symptom Cold Relief)',
                effects: '감기 증상 완화 (콧물, 기침, 발열) - 아세트아미노펜+슈도에페드린+덱스트로메토르판',
                usage: '성인 1회 1포, 1일 3회 식후 복용, 5일 이내 사용',
                warnings: ['졸음 유발 가능', '운전 시 주의', '알코올과 병용 금지', '고혈압 환자 주의 (슈도에페드린)'],
                sideEffects: ['졸음', '입마름', '변비', '혈압 상승'],
                ndc: ['Korean-OTC-Code'],
                brandNames: ['펜잘', 'Fenzal']
            },
            '낙센': {
                name: '낙센 (Naproxen)',
                rxcui: 'RXCUI:7258', // RxNorm 표준 코드
                category: '소염진통제 (NSAID)',
                effects: '관절염, 근육통, 염좌 등 염증성 통증 완화 - COX 억제제',
                usage: '성인 1회 220-440mg, 8-12시간마다, 최대 660mg/일 (RxNorm 표준)',
                warnings: ['위궤양 환자 금기 (FDA 경고)', '신장 질환자 주의', '심혈관 위험 증가', '임신 3기 금기'],
                sideEffects: ['위장 장애', '두통', '현기증', '부종'],
                ndc: ['00093-0149-01', '00093-0149-10'],
                brandNames: ['Naproxen', 'Aleve', 'Naprosyn']
            },
            '이부프로펜': {
                name: '이부프로펜 (Ibuprofen)', 
                rxcui: 'RXCUI:5640', // RxNorm 표준 코드
                category: '소염진통제 (NSAID)',
                effects: '해열, 진통, 소염 - 프로피온산 계열 NSAID',
                usage: '성인: 200-400mg, 6-8시간마다, 최대 1200mg/일 (RxNorm 표준)',
                warnings: ['위궤양 환자 금기', '심혈관 질환자 주의', '신장 기능 저하자 주의', '임신 3기 금기'],
                sideEffects: ['위장 장애', '두통', '현기증', '알레르기 반응'],
                ndc: ['00121-0871-05', '00121-0871-10'],
                brandNames: ['Advil', 'Motrin', 'Ibuprofen']
            },
            'default': {
                name: '약물',
                category: '의약품',
                effects: '의사나 약사에게 문의하시기 바랍니다',
                usage: '처방전 또는 포장지의 복용법을 따르세요',
                warnings: ['의료진과 상담 후 복용', '알레르기 반응 주의', '용법 용량 준수'],
                sideEffects: ['개인차에 따른 부작용 가능', '알레르기 반응', '위장 장애']
            }
        };

        // 약물명 정규화
        const normalizedName = medicationName.replace(/\s/g, '').toLowerCase();
        
        // 매칭되는 약물 찾기
        for (const [key, value] of Object.entries(knownMedications)) {
            if (normalizedName.includes(key.toLowerCase()) || 
                key.toLowerCase().includes(normalizedName)) {
                return { ...value, generated: new Date().toISOString() };
            }
        }

        // 기본값 반환
        return { 
            ...knownMedications.default, 
            name: medicationName,
            generated: new Date().toISOString() 
        };
    }

    // Ollama 서버 상태 확인
    async checkOllamaStatus() {
        return new Promise((resolve) => {
            const options = {
                hostname: '127.0.0.1',
                port: 11434,
                path: '/api/tags',
                method: 'GET',
                timeout: 3000 // 3초 타임아웃
            };
            
            const req = http.request(options, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', (error) => {
                console.error('Ollama 상태 확인 오류:', error);
                resolve(false);
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }
}

module.exports = AIRecommendationService;