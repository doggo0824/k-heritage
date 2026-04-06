// js/main.js
console.log('=== main.js loaded ===');

class CulturalHeritageApp {
    constructor() {
        console.log('=== CulturalHeritageApp constructor ===');
        this.currentFeature = null;
        this.features = {
            1: typeof DancheongWaveFeature !== 'undefined' ? DancheongWaveFeature : null,
            2: typeof NationalHeritageCRT !== 'undefined' ? NationalHeritageCRT : null,
            3: typeof SeokjeokFeature !== 'undefined' ? SeokjeokFeature : null,
            4: typeof TraditionalIncredibleBox !== 'undefined' ? TraditionalIncredibleBox : null,
            5: typeof Life4CutFeature !== 'undefined' ? Life4CutFeature : null,
            6: typeof SagwanLLM !== 'undefined' ? SagwanLLM : null,
            7: typeof ConservationExperience !== 'undefined' ? ConservationExperience : null,
            8: typeof InteractiveHeritage !== 'undefined' ? InteractiveHeritage : null
        };
        this.apiKey = 'A';
        this.touchStartTime = null;
        this.touchTimer = null;
        this.TOUCH_DURATION = 3000; // 3 초
        this.init();
    }
    
    async init() {
        console.log('=== init() called ===');
        this.checkAPIKey();
        this.setupNavigation();
        this.setupHandGesture();
        console.log('=== App initialized ===');
    }
    
    checkAPIKey() {
        const statusEl = document.getElementById('api-status');
        if (statusEl) {
            if (this.apiKey && this.apiKey !== 'A') {
                statusEl.className = 'api-status ok';
                statusEl.innerHTML = '<span>✅ API 키 설정 완료</span>';
            } else {
                statusEl.className = 'api-status warn';
                statusEl.innerHTML = '<span>⚠️ API 키가 설정되지 않았습니다.</span>';
            }
        }
    }
    
    setupNavigation() {
        console.log('=== setupNavigation() ===');
        const buttons = document.querySelectorAll('.feature-nav button');
        console.log('Buttons found:', buttons.length);
        
        // ✅ 수정: 클릭 이벤트 제거, 터치 감지로 대체
        buttons.forEach((btn, index) => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }
    
    setupHandGesture() {
        console.log('=== setupHandGesture() ===');
        const video = document.getElementById('webcam');
        const indicator = document.getElementById('touch-indicator');
        const progressBar = document.getElementById('touch-progress');
        const touchText = document.getElementById('touch-text');
        
        // 웹캠 시작
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                console.log('Webcam started');
                this.startHandDetection(video, indicator, progressBar, touchText);
            })
            .catch(err => {
                console.error('Webcam error:', err);
                alert('웹캠 접근 권한이 필요합니다.');
            });
    }
    
    async startHandDetection(video, indicator, progressBar, touchText) {
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults(this.onHandResults.bind(this, indicator, progressBar, touchText));
        
        video.addEventListener('play', async () => {
            const loop = async () => {
                if (video.readyState >= 2) {
                    await hands.send({ image: video });
                }
                requestAnimationFrame(loop);
            };
            loop();
        });
    }
    
    onHandResults(indicator, progressBar, touchText, results) {
        const buttons = document.querySelectorAll('.feature-nav button');
        let foundButton = null;
        
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                const thumbTip = landmarks[4];
                const button = this.findButtonAtPosition(thumbTip, buttons);
                if (button) {
                    foundButton = button;
                    break;
                }
            }
        }
        
        if (foundButton) {
            // ✅ 손가락이 버튼 위에 있음
            if (!this.touchStartTime) {
                this.touchStartTime = Date.now();
                indicator.style.display = 'block';
                console.log('Touch started on button:', foundButton.dataset.feature);
            }
            
            const elapsed = Date.now() - this.touchStartTime;
            const progress = Math.min((elapsed / this.TOUCH_DURATION) * 100, 100);
            progressBar.style.width = progress + '%';
            touchText.textContent = `터치 중... ${(elapsed / 1000).toFixed(1)}초`;
            
            // ✅ 3 초 도달
            if (elapsed >= this.TOUCH_DURATION) {
                this.activateFeature(foundButton.dataset.feature);
                this.resetTouch();
            }
        } else {
            // ✅ 손가락이 버튼에서 떨어짐
            this.resetTouch();
        }
    }
    
    findButtonAtPosition(landmark, buttons) {
        const thumbX = landmark.x * window.innerWidth;
        const thumbY = landmark.y * window.innerHeight;
        
        for (const btn of buttons) {
            const rect = btn.getBoundingClientRect();
            if (thumbX >= rect.left && thumbX <= rect.right &&
                thumbY >= rect.top && thumbY <= rect.bottom) {
                return btn;
            }
        }
        return null;
    }
    
    resetTouch() {
        if (this.touchStartTime) {
            this.touchStartTime = null;
            const indicator = document.getElementById('touch-indicator');
            const progressBar = document.getElementById('touch-progress');
            const touchText = document.getElementById('touch-text');
            if (indicator) indicator.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
            if (touchText) touchText.textContent = '터치 중...';
        }
    }
    
    activateFeature(id) {
        console.log('=== activateFeature() ===', id);
        this.resetTouch();
        
        if (this.currentFeature) {
            this.cleanupFeature();
        }
        const FeatureClass = this.features[id];
        console.log('FeatureClass:', FeatureClass);
        if (FeatureClass) {
            console.log('Creating new instance...');
            this.currentFeature = new FeatureClass(this.apiKey);
            const webcamContainer = document.getElementById('webcam-container');
            if (webcamContainer) {
                webcamContainer.style.display = 'block';
            }
            console.log('Feature activated successfully!');
        } else {
            console.error('❌ FeatureClass NOT found for:', id);
            alert('기능이 로드되지 않았습니다.');
        }
    }
    
    cleanupFeature() {
        console.log('=== cleanupFeature() ===');
        const video = document.getElementById('webcam');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        const container = document.getElementById('feature-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// 앱 시작
console.log('=== DOM Content Loaded ===');
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Creating app instance ===');
    new CulturalHeritageApp();
});
