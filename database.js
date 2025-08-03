const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 파일 경로 설정
const dbPath = path.join(__dirname, 'wonik_health.db');

// 데이터베이스 연결
const db = new Database(dbPath);

// 약물 테이블 생성
function initDatabase() {
    console.log('📊 데이터베이스 초기화 중...');
    
    // 약물 정보 테이블
    const createMedicationsTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dosage TEXT,
            time TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    createMedicationsTable.run();
    console.log('✅ 약물 테이블이 생성되었습니다!');
}

// 약물 CRUD 함수들
const medicationService = {
    // 약물 추가
    add: (name, dosage = '', time = '', notes = '') => {
        const insert = db.prepare(`
            INSERT INTO medications (name, dosage, time, notes) 
            VALUES (?, ?, ?, ?)
        `);
        
        try {
            const result = insert.run(name, dosage, time, notes);
            console.log(`✅ 약물 추가됨: ${name} (ID: ${result.lastInsertRowid})`);
            return { success: true, id: result.lastInsertRowid };
        } catch (error) {
            console.error('❌ 약물 추가 실패:', error);
            return { success: false, error: error.message };
        }
    },

    // 모든 약물 조회
    getAll: () => {
        const select = db.prepare('SELECT * FROM medications ORDER BY created_at DESC');
        return select.all();
    },

    // 약물 삭제
    delete: (id) => {
        const deleteStmt = db.prepare('DELETE FROM medications WHERE id = ?');
        try {
            const result = deleteStmt.run(id);
            console.log(`✅ 약물 삭제됨 (ID: ${id})`);
            return { success: true, changes: result.changes };
        } catch (error) {
            console.error('❌ 약물 삭제 실패:', error);
            return { success: false, error: error.message };
        }
    },

    // 약물 개수
    count: () => {
        const count = db.prepare('SELECT COUNT(*) as total FROM medications');
        return count.get().total;
    }
};

// 초기화 실행
initDatabase();

module.exports = {
    db,
    medicationService
};