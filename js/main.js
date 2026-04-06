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
        this.handCanvas = null;
        this.handCtx = null;
        this.init();
    }
    
    async init() {
        console.log('=== init() called ===');
        
        this.setupAudio();
        this.setupHandCanvas(); // ✅ 손 골격 표시용 캔버스 생성
        
        const videoReady = await this.startWebcam();
        console.log('Webcam ready:', videoReady);
        
        if (!videoReady) {
            alert('웹캠을 사용할 수 없습니다. 카메라 권한을 확인해주세요.');
            return;
        }
        
        await this.setupHandGesture();
        console.log('Hand gesture setup complete');
        
        console.log('=== App initialized ===');
    }
    
    setupHandCanvas() {
        // ✅ 손 골격을 표시할 캔버스 생성
        const canvas = document.createElement('canvas');
        canvas.id = 'hand-canvas';
        document.body.appendChild(canvas);
        
        this.handCanvas = canvas;
        this.handCtx = canvas.getContext('2d');
        this.resizeHandCanvas();
        
        window.addEventListener('resize', () => this.resizeHandCanvas());
    }
    
    resizeHandCanvas() {
        if (this.handCanvas) {
            this.handCanvas.width = window.innerWidth;
            this.handCanvas.height = window.innerHeight;
        }
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
        
        if (typeof Hands === 'undefined') {
            console.error('❌ MediaPipe Hands not loaded!');
            alert('MediaPipe 라이브러리를 로드할 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        console.log('MediaPipe Hands detected');
        
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        this.hands.onResults(this.onHandResults.bind(this, buttons, gauge, progressBar, touchText));
        
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
        
        const ctx = this.handCtx;
        ctx.clearRect(0, 0, this.handCanvas.width, this.handCanvas.height);
        
        let foundButton = null;
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
                const indexFingerTip = landmarks[8];
                const button = this.findButtonAtPosition(indexFingerTip, buttons);
                if (button) {
                    foundButton = button;
                    break;
                }
            }
            
            // ✅ 손 골격 그리기
            this.drawHandSkeleton(landmarks);
        }
        
        if (foundButton) {
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
            this.resetTouch();
        }
    }
    
    // ✅ 손 골격 그리기 함수 추가
    drawHandSkeleton(landmarks) {
        const ctx = this.handCtx;
        
        if (!landmarks || landmarks.length === 0) return;
        
        // 손가락 연결선 그리기
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],     // 엄지
            [0, 5], [5, 6], [6, 7], [7, 8],     // 검지
            [0, 9], [9, 10], [10, 11], [11, 12], // 중지
            [0, 13], [13, 14], [14, 15], [15, 16], // 약지
            [0, 17], [17, 18], [18, 19], [19, 20]  // 새끼손가락
        ];
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        
        for (const [start, end] of connections) {
            const startX = landmarks[start].x * this.handCanvas.width;
            const startY = landmarks[start].y * this.handCanvas.height;
            const endX = landmarks[end].x * this.handCanvas.width;
            const endY = landmarks[end].y * this.handCanvas.height;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 랜드마크 점 그리기
        ctx.fillStyle = '#00ff00';
        for (const landmark of landmarks) {
            const x = landmark.x * this.handCanvas.width;
            const y = landmark.y * this.handCanvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // 검지 손가락 끝 강조
        const indexTip = landmarks[8];
        const ix = indexTip.x * this.handCanvas.width;
        const iy = indexTip.y * this.handCanvas.height;
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ix, iy, 8, 0, 2 * Math.PI);
        ctx.stroke();
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
        
        setTimeout(() => { progressBar.style.width = '50%'; }, 500);
        setTimeout(() => { progressBar.style.width = '100%'; }, 1500);
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
