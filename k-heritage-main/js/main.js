// js/main.js
class CulturalHeritageApp {
    constructor() {
        this.currentFeature = null;
        this.features = {
            1: DancheongWaveFeature,
            2: NationalHeritageCRT,
            3: SeokjeokFeature,
            4: TraditionalIncredibleBox,
            5: Life4CutFeature,
            6: SagwanLLM,
            7: ConservationExperience,
            8: InteractiveHeritage
        };
        this.apiKey = 'A'; // ⚠️ 보안 주의: 실제 배포 시 환경 변수 사용
        this.init();
    }
    
    async init() {
        this.checkAPIKey();
        this.setupNavigation();
    }
    
    checkAPIKey() {
        const statusEl = document.getElementById('api-status');
        if (this.apiKey && this.apiKey !== 'A') {
            statusEl.className = 'api-status ok';
            statusEl.innerHTML = '<span>✅ API 키 설정 완료</span>';
        } else {
            statusEl.className = 'api-status warn';
            statusEl.innerHTML = '<span>⚠️ API 키가 설정되지 않았습니다. 일부 기능이 제한될 수 있습니다.</span>';
        }
    }
    
    setupNavigation() {
        document.querySelectorAll('.feature-nav button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const featureId = e.target.dataset.feature;
                this.activateFeature(featureId);
            });
        });
    }
    
    activateFeature(id) {
        if (this.currentFeature) {
            this.cleanupFeature();
        }
        
        const FeatureClass = this.features[id];
        if (FeatureClass) {
            this.currentFeature = new FeatureClass(this.apiKey);
            document.getElementById('webcam-container').style.display = 'block';
        }
    }
    
    cleanupFeature() {
        const video = document.getElementById('webcam');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        const container = document.getElementById('feature-container');
        container.innerHTML = '';
        
        if (this.currentFeature && this.currentFeature.scene) {
            this.currentFeature.scene.clear();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CulturalHeritageApp();
});
