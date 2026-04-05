class DancheongWaveFeature {
    constructor(apiKey) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.dancheongImages = [];
        this.init();
    }
    async init() {
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
        this.setupWebcam();
        this.setupCanvas();
        this.startMediaPipe();
    }
    setupWebcam() {
        const video = document.getElementById('webcam');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { video.srcObject = stream; })
            .catch(err => { alert('웹캠 접근 권한이 필요합니다.'); });
    }
    setupCanvas() {
        const video = document.getElementById('webcam');
        this.canvas.width = video.videoWidth || 640;
        this.canvas.height = video.videoHeight || 480;
        document.getElementById('feature-container').appendChild(this.canvas);
    }
    async startMediaPipe() {
        const hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7 });
        hands.onResults(this.onResults.bind(this));
        const video = document.getElementById('webcam');
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
        const video = document.getElementById('webcam');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                this.drawHandLandmarks(ctx, landmarks);
            }
        }
        this.drawDancheongWave(ctx);
    }
    drawHandLandmarks(ctx, landmarks) {
        ctx.fillStyle = '#ff6b6b';
        for (const landmark of landmarks) {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    drawDancheongWave(ctx) {
        const time = Date.now() / 1000;
        this.dancheongImages.forEach((img, index) => {
            const baseX = 100 + index * 150;
            const baseY = 200;
            const waveOffset = Math.sin(time * 2 + index) * 10;
            ctx.globalAlpha = 0.7;
            ctx.drawImage(img, baseX - 30, baseY + waveOffset - 30, 60, 60);
            ctx.globalAlpha = 1.0;
        });
    }
}
