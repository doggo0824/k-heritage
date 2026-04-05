class NationalHeritageCRT {
    constructor(apiKey) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cube = null;
        this.init();
    }
    async init() {
        this.setupThreeJS();
        this.setupWebcam();
        this.setupMediaPipe();
        this.load3DModel();
    }
    setupThreeJS() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(300, 300);
        this.renderer.domElement.id = '3d-output';
        document.getElementById('feature-container').appendChild(this.renderer.domElement);
        this.camera.position.z = 3;
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 2);
        this.scene.add(directionalLight);
    }
    setupWebcam() {
        const video = document.getElementById('webcam');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { video.srcObject = stream; });
    }
    async setupMediaPipe() {
        const hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
        hands.setOptions({ maxNumHands: 2, minDetectionConfidence: 0.5 });
        hands.onResults(this.onHandResults.bind(this));
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
    load3DModel() {
        const loader = new THREE.GLTFLoader();
        loader.load('assets/3d-models/heritage.glb', (gltf) => {
            this.cube = gltf.scene;
            this.cube.scale.set(0.5, 0.5, 0.5);
            this.scene.add(this.cube);
        });
    }
    onHandResults(results) {
        const isOpenHand = this.detectOpenHand(results.multiHandLandmarks);
        if (isOpenHand && this.cube) {
            this.cube.visible = true;
            this.cube.rotation.y += 0.01;
        } else {
            if (this.cube) this.cube.visible = false;
        }
        this.renderer.render(this.scene, this.camera);
    }
    detectOpenHand(landmarks) {
        if (!landmarks || landmarks.length === 0) return false;
        const hand = landmarks[0];
        const fingerTips = [8, 12, 16, 20];
        const fingerJoints = [5, 9, 13, 17];
        return fingerTips.every((tip, i) => hand[tip].y < hand[fingerJoints[i]].y);
    }
}
