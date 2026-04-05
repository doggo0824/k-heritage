class SeokjeokFeature {
    constructor(apiKey) {
        this.handSigns = [
            { name: '합장', description: '두 손을 마주 보게 모아 정성스러운 의미를 표현' },
            { name: '손가락', description: '손가락으로 숫자나 모양을 표현' },
            { name: '주먹', description: '손을 주먹으로 쥐는 자세' },
            { name: '펼침', description: '손을 펴서 개방적인 제스처' }
        ];
        this.init();
    }
    async init() {
        const hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
        hands.setOptions({ maxNumHands: 1, minDetectionConfidence: 0.5 });
        hands.onResults(this.onResults.bind(this));
        const video = document.getElementById('webcam');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { video.srcObject = stream; })
            .then(() => {
                video.addEventListener('play', async () => {
                    const loop = async () => {
                        if (video.readyState >= 2) await hands.send({ image: video });
                        requestAnimationFrame(loop);
                    };
                    loop();
                });
            });
    }
    onResults(results) {
        const container = document.getElementById('feature-container');
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const sign = this.recognizeHandSign(landmarks);
            container.innerHTML = `
                <div class="sign-result">
                    <h3>인식된 수인: ${sign.name}</h3>
                    <p>${sign.description}</p>
                </div>
            `;
        }
    }
    recognizeHandSign(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
        let fingersUp = 0;
        const fingerTips = [8, 12, 16, 20];
        const fingerJoints = [5, 9, 13, 17];
        for (let i = 0; i < 4; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerJoints[i]].y) fingersUp++;
        }
        if (distance < 0.1) return this.handSigns[0];
        if (fingersUp === 4) return this.handSigns[3];
        if (fingersUp === 0) return this.handSigns[2];
        return this.handSigns[1];
    }
}
