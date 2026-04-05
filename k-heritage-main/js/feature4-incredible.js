class TraditionalIncredibleBox {
    constructor(apiKey) {
        this.instruments = [
            { name: '거문고', sound: 'assets/sounds/geomungo.mp3', key: 'q' },
            { name: '해금', sound: 'assets/sounds/haegeum.mp3', key: 'w' },
            { name: '가야금', sound: 'assets/sounds/gayageum.mp3', key: 'e' },
            { name: '대금', sound: 'assets/sounds/daegeum.mp3', key: 'r' },
            { name: '장구', sound: 'assets/sounds/janggu.mp3', key: 'a' },
            { name: '북', sound: 'assets/sounds/buk.mp3', key: 's' }
        ];
        this.audios = {};
        this.init();
    }
    init() {
        this.loadSounds();
        this.setupKeyboard();
        this.renderUI();
    }
    async loadSounds() {
        for (const inst of this.instruments) {
            const audio = new Audio(inst.sound);
            audio.volume = 0.5;
            this.audios[inst.key] = audio;
        }
    }
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.audios[key]) this.playInstrument(key);
        });
    }
    renderUI() {
        const container = document.getElementById('feature-container');
        container.innerHTML = `
            <div class="instrument-panel">
                <h2>🎵 전통 악기 인크레디박스</h2>
                <div class="instruments-grid">
                    ${this.instruments.map(inst => `
                        <button class="instrument-btn" data-key="${inst.key}">
                            <span class="key">${inst.key.toUpperCase()}</span>
                            <span class="name">${inst.name}</span>
                        </button>
                    `).join('')}
                </div>
                <p class="instructions">키보드나 버튼을 눌러 연주하세요</p>
            </div>
        `;
        container.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                this.playInstrument(key);
            });
        });
    }
    playInstrument(key) {
        const audio = this.audios[key];
        if (audio) {
            audio.currentTime = 0;
            audio.play();
            const btn = document.querySelector(`[data-key="${key}"]`);
            btn.classList.add('playing');
            setTimeout(() => btn.classList.remove('playing'), 200);
        }
    }
}
