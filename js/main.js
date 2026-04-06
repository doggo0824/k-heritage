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
        this.TOUCH_DURATION = 3000;
        this.audioContext = null;
        this.init();
    }
    
    async init() {
        console.log('=== init() called ===');
        this.startWebcam();
        this.setupAudio();
        this.setupHandGesture();
        console.log('=== App initialized ===');
    }
    
    startWebcam() {
        const video = document.getElementById('webcam-bg');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                console.log('Webcam started');
            })
            .catch(err => {
                console.error('Webcam error:', err);
                alert('웹캠 접근 권한이 필요합니다.');
            });
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized');
        } catch (e) {
            console.error('Audio setup failed:', e);
        }
    }
    
    playSound(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'hover':
                oscillator.frequency.value = 440;
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
            case 'touch':
                oscillator.frequency.value = 660;
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
            case 'success':
                oscillator.frequency.value = 880;
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
            case 'instrument':
                oscillator.frequency.value = 523.25;
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.5);
                break;
            default:
                oscillator.frequency.value = 440;
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }
    
    setupHandGesture() {
        console.log('=== setupHandGesture() ===');
        const video = document.getElementById('webcam-bg');
        const buttons = document.querySelectorAll('.feature-btn');
        const gauge = document.getElementById('touch-gauge');
        const progressBar = document.querySelector('.gauge-fill');
        const touchText = document.getElementById('touch-text');
        
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
        
        hands.onResults(this.onHandResults.bind(this, buttons, gauge, progressBar, touchText));
        
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
    
    onHandResults(buttons, gauge, progressBar, touchText, results) {
        let foundButton = null;
        
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                const indexFingerTip = landmarks[8];
                const button = this.findButtonAtPosition(indexFingerTip, buttons);
                if (button) {
                    foundButton = button;
                    break;
                }
            }
        }
        
        if (foundButton) {
            if (!this.touchStartTime) {
                this.touchStartTime = Date.now();
                gauge.style.display = 'block';
                this.playSound('touch');
                console.log('Touch started on button:', foundButton.dataset.feature);
            }
            
            const elapsed = Date.now() - this.touchStartTime;
            const progress = Math.min((elapsed / this.TOUCH_DURATION) * 100, 100);
            const strokeDashoffset = 283 - (283 * progress / 100);
            progressBar.style.strokeDashoffset = strokeDashoffset;
            touchText.textContent = `터치 중... ${(elapsed / 1000).toFixed(1)}초`;
            
            if (elapsed >= this.TOUCH_DURATION) {
                this.playSound('success');
                this.showLoadingOverlay();
                setTimeout(() => {
                    this.activateFeature(foundButton.dataset.feature);
                    this.hideLoadingOverlay();
                }, 2000);
                this.resetTouch();
            }
        } else {
            this.resetTouch();
        }
    }
    
    findButtonAtPosition(landmark, buttons) {
        const indexX = landmark.x * window.innerWidth;
        const indexY = landmark.y * window.innerHeight;
        
        for (const btn of buttons) {
            const rect = btn.getBoundingClientRect();
            if (indexX >= rect.left && indexX <= rect.right &&
                indexY >= rect.top && indexY <= rect.bottom) {
                return btn;
            }
        }
        return null;
    }
    
    resetTouch() {
        if (this.touchStartTime) {
            this.touchStartTime = null;
            const gauge = document.getElementById('touch-gauge');
            const progressBar = document.querySelector('.gauge-fill');
            const touchText = document.getElementById('touch-text');
            if (gauge) gauge.style.display = 'none';
            if (progressBar) progressBar.style.strokeDashoffset = '283';
            if (touchText) touchText.textContent = '터치 중...';
        }
    }
    
    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        const progressBar = document.querySelector('.loading-progress');
        overlay.classList.add('active');
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.width = '50%';
        }, 500);
        
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 1500);
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.remove('active');
        const progressBar = document.querySelector('.loading-progress');
        progressBar.style.width = '0%';
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
            this.currentFeature = new FeatureClass(this.apiKey, this);
            const container = document.getElementById('feature-container');
            if (container) {
                container.classList.add('active');
                container.innerHTML = '';
            }
            console.log('Feature activated successfully!');
        } else {
            console.error('❌ FeatureClass NOT found for:', id);
            alert('기능이 로드되지 않았습니다.');
        }
    }
    
    cleanupFeature() {
        console.log('=== cleanupFeature() ===');
        const video = document.getElementById('webcam-bg');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        const container = document.getElementById('feature-container');
        if (container) {
            container.innerHTML = '';
            container.classList.remove('active');
        }
    }
}

// 앱 시작
console.log('=== DOM Content Loaded ===');
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Creating app instance ===');
    new CulturalHeritageApp();
});
