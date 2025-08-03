// 🤖 AI 자동 생성 테스트 - Wonik Health 앱
// 약물 관리 기능 검증 테스트

describe('Medication Validation Tests', () => {
    // validateMedicationName 함수 테스트
    describe('validateMedicationName', () => {
        // ✅ 정상 케이스
        test('유효한 한글 약물명', () => {
            expect(validateMedicationName('타이레놀')).toEqual({ valid: true });
            expect(validateMedicationName('아모잘탄')).toEqual({ valid: true });
            expect(validateMedicationName('비타민')).toEqual({ valid: true });
        });

        test('유효한 영문 약물명', () => {
            expect(validateMedicationName('Aspirin')).toEqual({ valid: true });
            expect(validateMedicationName('Vitamin-D3')).toEqual({ valid: true });
            expect(validateMedicationName('Co.Codamol')).toEqual({ valid: true });
        });

        test('유효한 숫자 포함 약물명', () => {
            expect(validateMedicationName('비타민D3')).toEqual({ valid: true });
            expect(validateMedicationName('Omega-3')).toEqual({ valid: true });
            expect(validateMedicationName('CoQ10')).toEqual({ valid: true });
        });

        // ❌ 에러 케이스
        test('빈 값 또는 null', () => {
            expect(validateMedicationName('')).toEqual({
                valid: false,
                message: '약물 이름을 입력해주세요.'
            });
            
            expect(validateMedicationName(null)).toEqual({
                valid: false,
                message: '약물 이름을 입력해주세요.'
            });
            
            expect(validateMedicationName(undefined)).toEqual({
                valid: false,
                message: '약물 이름을 입력해주세요.'
            });
        });

        test('길이 제한 초과', () => {
            const longName = 'a'.repeat(51);
            expect(validateMedicationName(longName)).toEqual({
                valid: false,
                message: '약물 이름은 50자 이하로 입력해주세요.'
            });
        });

        test('허용되지 않는 특수문자', () => {
            expect(validateMedicationName('타이레놀@#$')).toEqual({
                valid: false,
                message: '약물 이름에는 한글, 영문, 숫자, 공백, 하이픈, 마침표만 사용할 수 있습니다.'
            });
            
            expect(validateMedicationName('Aspirin%')).toEqual({
                valid: false,
                message: '약물 이름에는 한글, 영문, 숫자, 공백, 하이픈, 마침표만 사용할 수 있습니다.'
            });
        });

        // 🧠 엣지 케이스
        test('경계값 테스트', () => {
            const fiftyChars = 'a'.repeat(50);
            expect(validateMedicationName(fiftyChars)).toEqual({ valid: true });
            
            const oneChar = 'a';
            expect(validateMedicationName(oneChar)).toEqual({ valid: true });
        });

        test('공백 처리', () => {
            expect(validateMedicationName('   ')).toEqual({
                valid: false,
                message: '약물 이름을 입력해주세요.'
            });
            
            expect(validateMedicationName('타이레놀 서방정')).toEqual({ valid: true });
        });
    });

    // validateDosage 함수 테스트
    describe('validateDosage', () => {
        test('유효한 용량 형식', () => {
            expect(validateDosage('5mg')).toEqual({ valid: true });
            expect(validateDosage('10정')).toEqual({ valid: true });
            expect(validateDosage('2.5ml')).toEqual({ valid: true });
            expect(validateDosage('1캡슐')).toEqual({ valid: true });
        });

        test('빈 값 허용 (선택사항)', () => {
            expect(validateDosage('')).toEqual({ valid: true });
            expect(validateDosage(null)).toEqual({ valid: true });
        });

        test('잘못된 용량 형식', () => {
            expect(validateDosage('매우많이')).toEqual({
                valid: false,
                message: '올바른 용량 형식을 입력해주세요. (예: 5mg, 10정)'
            });
        });

        test('길이 제한', () => {
            const longDosage = 'a'.repeat(21);
            expect(validateDosage(longDosage)).toEqual({
                valid: false,
                message: '용량은 20자 이하로 입력해주세요.'
            });
        });
    });

    // validateTime 함수 테스트
    describe('validateTime', () => {
        test('유효한 시간 형식', () => {
            expect(validateTime('08:30')).toEqual({ valid: true });
            expect(validateTime('23:59')).toEqual({ valid: true });
            expect(validateTime('00:00')).toEqual({ valid: true });
        });

        test('빈 값 허용 (선택사항)', () => {
            expect(validateTime('')).toEqual({ valid: true });
            expect(validateTime(null)).toEqual({ valid: true });
        });

        test('잘못된 시간 형식', () => {
            expect(validateTime('25:00')).toEqual({
                valid: false,
                message: '올바른 시간 형식을 입력해주세요. (예: 08:30)'
            });
            
            expect(validateTime('12:60')).toEqual({
                valid: false,
                message: '올바른 시간 형식을 입력해주세요. (예: 08:30)'
            });
            
            expect(validateTime('8:30')).toEqual({
                valid: false,
                message: '올바른 시간 형식을 입력해주세요. (예: 08:30)'
            });
        });
    });

    // sanitizeInput 함수 테스트
    describe('sanitizeInput', () => {
        test('HTML 태그 제거', () => {
            expect(sanitizeInput('<script>alert("xss")</script>타이레놀')).toBe('타이레놀');
            expect(sanitizeInput('<b>볼드텍스트</b>')).toBe('볼드텍스트');
        });

        test('특수문자 이스케이프', () => {
            expect(sanitizeInput('타이레놀<>&"\'')).toBe('타이레놀');
            expect(sanitizeInput('Aspirin & Co')).toBe('Aspirin  Co');
        });

        test('정상 텍스트 유지', () => {
            expect(sanitizeInput('정상적인 약물명')).toBe('정상적인 약물명');
            expect(sanitizeInput('Vitamin-D3')).toBe('Vitamin-D3');
        });
    });
});

// 🧪 통합 테스트
describe('Medication Management Integration Tests', () => {
    test('전체 약물 추가 워크플로우', () => {
        const testCases = [
            {
                input: { name: '타이레놀', dosage: '500mg', time: '08:00' },
                expected: { success: true }
            },
            {
                input: { name: '', dosage: '500mg', time: '08:00' },
                expected: { success: false, error: '약물 이름을 입력해주세요.' }
            },
            {
                input: { name: '타이레놀@#$', dosage: '500mg', time: '08:00' },
                expected: { success: false, error: '약물 이름에는 한글, 영문, 숫자, 공백, 하이픈, 마침표만 사용할 수 있습니다.' }
            }
        ];

        testCases.forEach(({ input, expected }) => {
            const nameValidation = validateMedicationName(input.name);
            const dosageValidation = validateDosage(input.dosage);
            const timeValidation = validateTime(input.time);

            const allValid = nameValidation.valid && dosageValidation.valid && timeValidation.valid;
            
            if (expected.success) {
                expect(allValid).toBe(true);
            } else {
                expect(allValid).toBe(false);
            }
        });
    });
});

// 🎯 성능 테스트
describe('Performance Tests', () => {
    test('대량 검증 성능', () => {
        const start = performance.now();
        
        // 1000개 약물명 검증
        for (let i = 0; i < 1000; i++) {
            validateMedicationName(`약물${i}`);
        }
        
        const end = performance.now();
        const duration = end - start;
        
        // 1초 이내에 완료되어야 함
        expect(duration).toBeLessThan(1000);
        console.log(`1000개 검증 완료: ${duration.toFixed(2)}ms`);
    });
});