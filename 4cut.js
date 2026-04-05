// js/feature5-life4cut.js
class Life4CutFeature {
    constructor() {
        this.patterns = [];
        this.capturedFrames = [];
        this.currentFrame = 0;
        this.init();
    }
    
    async init() {
        // 문양 파일 로드
        const patternPaths = [
            'assets/dancheong/pattern1.png',
            'assets/dancheong/pattern2.png'
        ];
        
        for (const path of patternPaths) {
            const img = new Image();
            img.src = path;
            await new Promise(resolve => img.onload = resolve);
            this.patterns.push(img);
        }
        
        this.setupWebcam();
        this.setupCanvas();
        this.renderUI();
    }
    
    setupWebcam() {
        const video = document.getElementById('webcam');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { video.srcObject = stream; });
    }
    
    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        document.getElementById('feature-container').appendChild(this.canvas);
    }
    
    renderUI() {
        const container = document.getElementById('feature-container');
        container.innerHTML += `
            <div class="capture-controls">
                <button id="capture-btn">📸 컷 촬영 (4 회)</button>
                <button id="download-btn">💾 다운로드</button>
                <button id="reset-btn">🔄 초기화</button>
            </div>
            <div class="frame-indicator">
                촬영된 컷: <span id="frame-count">0</span>/4
            </div>
        `;
        
        document.getElementById('capture-btn').addEventListener('click', () => this.captureFrame());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadResult());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    }
    
    captureFrame() {
        if (this.capturedFrames.length >= 4) {
            alert('4 컷이 모두 촬영되었습니다!');
            return;
        }
        
        const video = document.getElementById('webcam');
        const ctx = this.canvas.getContext('2d');
        
        // 프레임 캡처
        this.capturedFrames.push({
            image: ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
            timestamp: Date.now()
        });
        
        document.getElementById('frame-count').textContent = this.capturedFrames.length;
        
        // 프레임 렌더링
        this.renderAllFrames();
    }
    
    renderAllFrames() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const frameWidth = 380;
        const frameHeight = 280;
        const gap = 20;
        
        this.capturedFrames.forEach((frame, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = col * (frameWidth + gap);
            const y = row * (frameHeight + gap);
            
            // 프레임 배경 (전통문양)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(x, y, frameWidth, frameHeight);
            
            // 문양 오버레이
            const pattern = this.patterns[index % this.patterns.length];
            ctx.globalAlpha = 0.3;
            ctx.drawImage(pattern, x, y, frameWidth, frameHeight);
            ctx.globalAlpha = 1.0;
            
            // 캡처된 이미지
            ctx.putImageData(frame.image, x + 10, y + 10, 0, 0, frameWidth - 20, frameHeight - 20);
            
            // 프레임 번호
            ctx.fillStyle = '#fff';
            ctx.font = '20px Noto Sans KR';
            ctx.fillText(`${index + 1}컷`, x + 15, y + 25);
        });
    }
    
    downloadResult() {
        if (this.capturedFrames.length < 4) {
            alert('4 컷을 모두 촬영해주세요!');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `life4cut_${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    reset() {
        this.capturedFrames = [];
        this.currentFrame = 0;
        document.getElementById('frame-count').textContent = '0';
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
