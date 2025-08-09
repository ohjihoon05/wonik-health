// 간단한 localStorage 기반 데이터 저장소
class MedicationStorage {
    constructor() {
        this.storageKey = 'wonik_health_medications';
        this.initStorage();
    }

    // 저장소 초기화
    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        console.log('📊 로컬 저장소가 초기화되었습니다!');
    }

    // 모든 약물 가져오기
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return JSON.parse(data) || [];
        } catch (error) {
            console.error('❌ 데이터 로드 실패:', error);
            return [];
        }
    }

    // 약물 추가
    add(medicationData) {
        try {
            const medications = this.getAll();
            const newMedication = {
                id: Date.now(), // 간단한 ID 생성
                name: medicationData.name,
                dosage: medicationData.dosage || '',
                time: medicationData.time || '',
                notes: medicationData.notes || '',
                created_at: new Date().toISOString(),
                // AI 정보 필드 추가
                aiInfo: medicationData.aiInfo || null
            };
            
            medications.push(newMedication);
            localStorage.setItem(this.storageKey, JSON.stringify(medications));
            
            console.log(`✅ 약물 추가됨: ${newMedication.name} (ID: ${newMedication.id})`);
            return { success: true, id: newMedication.id };
        } catch (error) {
            console.error('❌ 약물 추가 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 약물 업데이트 (AI 정보 추가용)
    update(id, updateData) {
        try {
            const medications = this.getAll();
            const medicationIndex = medications.findIndex(med => med.id === parseInt(id));
            
            if (medicationIndex === -1) {
                return { success: false, error: '약물을 찾을 수 없습니다.' };
            }

            // 기존 데이터에 새 데이터 병합
            medications[medicationIndex] = {
                ...medications[medicationIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(medications));
            
            console.log(`✅ 약물 정보 업데이트됨: ${medications[medicationIndex].name} (ID: ${id})`);
            return { success: true, medication: medications[medicationIndex] };
        } catch (error) {
            console.error('❌ 약물 업데이트 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 특정 약물 조회
    getById(id) {
        try {
            const medications = this.getAll();
            return medications.find(med => med.id === parseInt(id)) || null;
        } catch (error) {
            console.error('❌ 약물 조회 실패:', error);
            return null;
        }
    }

    // 약물 삭제
    delete(id) {
        try {
            const medications = this.getAll();
            const filteredMedications = medications.filter(med => med.id !== parseInt(id));
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredMedications));
            
            console.log(`✅ 약물 삭제됨 (ID: ${id})`);
            return { success: true, changes: 1 };
        } catch (error) {
            console.error('❌ 약물 삭제 실패:', error);
            return { success: false, error: error.message };
        }
    }

    // 약물 개수
    count() {
        return this.getAll().length;
    }
}

// 전역 인스턴스 생성
window.medicationStorage = new MedicationStorage();