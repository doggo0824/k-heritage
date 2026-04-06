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
        this.hands = null;
        this.isHandDetectionReady = false;
        this.init();
    }
    
    async init() {
        console.log('=== init() called ===');
        
        // 1. 오디오 설정
        this.setupAudio();
        
        // 2. 웹캠 시작 및 대기
        const videoReady = await this.startWebcam();
        console.log('Webcam ready:', videoReady);
        
        if (!videoReady) {
            alert('웹캠을 사용할 수 없습니다. 카메라 권한을 확인해주세요.');
            return;
        }
        
        // 3. 손 인식 설정 (비디오가 준비된 후)
        await this.setupHandGesture();
        console.log('Hand gesture setup complete');
        
        console.log('=== App initialized ===');
    }
    
    startWebcam() {
        return new Promise((resolve) => {
            const video = document.getElementById('webcam-bg');
            
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            })
            .then(stream => {
                video.srcObject = stream;
                
                // 비디오가 실제로 재생될 때까지 대기
                video.onloadedmetadata = () => {
                    console.log('Video metadata loaded');
                    video.play().then(() => {
                        console.log('Video playing');
                        resolve(true);
                    }).catch(err => {
                        console.error('Video play failed:', err);
                        resolve(false);
                    });
                };
            })
            .catch(err => {
                console.error('Webcam error:', err);
                resolve(false);
            });
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
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
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
        }
    }
    
    async setupHandGesture() {
        console.log('=== setupHandGesture() ===');
        
        const video = document.getElementById('webcam-bg');
        const buttons = document.querySelectorAll('.feature-btn');
        const gauge = document.getElementById('touch-gauge');
        const progressBar = document.querySelector('.gauge-fill');
        const touchText = document.getElementById('touch-text');
        
        // MediaPipe Hands 로드 확인
        if (typeof Hands === 'undefined') {
            console.error('❌ MediaPipe Hands not loaded!');
            alert('MediaPipe 라이브러리를 로드할 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        console.log('MediaPipe Hands detected');
        
        // Hands 인스턴스 생성
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,  // 낮게 설정하여 인식률 향상
            minTrackingConfidence: 0.5
        });
        
        this.hands.onResults(this.onHandResults.bind(this, buttons, gauge, progressBar, touchText));
        
        // 비디오가 재생된 후에만 손 인식 시작
        if (video.readyState >= 2) {
            console.log('Video ready, starting detection loop');
            this.startDetectionLoop(video);
        } else {
            video.addEventListener('loadeddata', () => {
                console.log('Video loaded, starting detection loop');
                this.startDetectionLoop(video);
            });
        }
    }
    
    startDetectionLoop(video) {
        const loop = async () => {
            try {
                if (video.readyState >= 2 && video.paused === false) {
                    await this.hands.send({ image: video });
                }
                requestAnimationFrame(loop);
            } catch (error) {
                console.error('Detection loop error:', error);
            }
        };
        
        requestAnimationFrame(loop);
        this.isHandDetectionReady = true;
        console.log('Detection loop started');
    }
    
    onHandResults(buttons, gauge, progressBar, touchText, results) {
        if (!this.isHandDetectionReady) return;
        
        let foundButton = null;
        
        // 손 랜드마크가 있는지 확인
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            // 첫 번째 손을 사용
            const landmarks = results.multiHandLandmarks[0];
            
            // 검지 손가락 끝 (landmark 8)
            const indexFingerTip = landmarks[8];
            
            // 버튼 위치 확인
            foundButton = this.findButtonAtPosition(indexFingerTip, buttons);
        }
        
        if (foundButton) {
            // 손가락이 버튼 위에 있음
            if (!this.touchStartTime) {
                this.touchStartTime = Date.now();
                gauge.style.display = 'block';
                this.playSound('touch');
                console.log('✓ Touch started on button:', foundButton.dataset.feature);
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
            // 손가락이 버튼에서 떨어짐
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
            console.log('✓ Feature activated successfully!');
        } else {
            console.error('❌ FeatureClass NOT found for:', id);
            alert('기능이 로드되지 않았습니다.');
        }
    }
    
    cleanupFeature() {
        console.log('=== cleanupFeature() ===');
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
