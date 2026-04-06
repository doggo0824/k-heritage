// js/feature1-dancheong.js
class DancheongWaveFeature {
    constructor(apiKey, app) {
        this.apiKey = apiKey;
        this.app = app;
        this.canvas = null;
        this.ctx = null;
        this.dancheongImages = [];
        this.selectedPiece = null;
        this.init();
    }
    
    async init() {
        const container = document.getElementById('feature-container');
        container.innerHTML = `
            <div class="dancheong-panel">
                <h2 style="color:#00ff00; text-shadow:0 0 20px rgba(0,255,0,0.8); font-family:'Courier New', monospace; margin-bottom:2rem;">🌊 단청 물결</h2>
                <p style="color:#00ff00; margin-bottom:2rem; font-family:'Courier New', monospace;">
                    손가락으로 단청 문양을 선택하세요
                </p>
                <div class="dancheong-canvas-container">
                    <canvas id="dancheong-canvas"></canvas>
                </div>
                <p style="color:#00ff00; margin-top:2rem; font-family:'Courier New', monospace;">
                    웹캠이 활성화됩니다
                </p>
            </div>
        `;
        
        this.canvas = document.getElementById('dancheong-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 500;
        
        await this.loadImages();
        this.setupWebcam();
        this.startMediaPipe();
    }
    
    async loadImages() {
        const imagePaths = [
            'assets/dancheong/pattern1.png',
            'assets/dancheong/pattern2.png',
            'assets/dancheong/pattern3.png'
        ];
        
        for (const path of imagePaths) {
            const img = new Image();
            img.src = path;
            await new Promise(resolve => img.onload = resolve);
            this.dancheongImages.push(img);
        }
    }
    
    setupWebcam() {
        const video = document.getElementById('webcam-bg');
        if (video && video.srcObject) {
            console.log('Using existing webcam stream');
        }
    }
    
    async startMediaPipe() {
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
        
        hands.onResults(this.onResults.bind(this));
        
        const video = document.getElementById('webcam-bg');
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
    
    onResults(results) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 단청 문양 그리기 (물결 효과)
        this.drawDancheongWave(ctx);
        
        // 손 랜드마크 표시
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                this.drawHandLandmarks(ctx, landmarks);
            }
        }
    }
    
    drawHandLandmarks(ctx, landmarks) {
        ctx.fillStyle = '#00ff00';
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    drawDancheongWave(ctx) {
        const time = Date.now() / 1000;
        const waveHeight = 15;
        const waveLength = 50;
        
        this.dancheongImages.forEach((img, index) => {
            const baseX = 100 + index * 200;
            const baseY = 250;
            
            // 물결 효과
            const waveOffset = Math.sin(time * 2 + index * 0.5) * waveHeight;
            const scale = 0.8 + Math.sin(time * 3 + index) * 0.1;
            
            ctx.globalAlpha = 0.7;
            ctx.save();
            ctx.translate(baseX, baseY + waveOffset);
            ctx.scale(scale, scale);
            ctx.drawImage(img, -50, -50, 100, 100);
            ctx.restore();
            ctx.globalAlpha = 1.0;
        });
    }
}
