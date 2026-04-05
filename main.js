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
        this.init();
    }
    
    init() {
        this.setupNavigation();
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
        // 이전 기능 정리
        if (this.currentFeature) {
            this.cleanupFeature();
        }
        
        // 새로운 기능 시작
        const FeatureClass = this.features[id];
        if (FeatureClass) {
            this.currentFeature = new FeatureClass();
            document.getElementById('webcam-container').style.display = 'block';
        }
    }
    
    cleanupFeature() {
        // 웹캠 스트리밍 정리
        const video = document.getElementById('webcam');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // 캔버스 정리
        const container = document.getElementById('feature-container');
        container.innerHTML = '';
        
        // 3D 장면 정리
        if (this.currentFeature && this.currentFeature.scene) {
            this.currentFeature.scene.clear();
        }
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    new CulturalHeritageApp();
});
